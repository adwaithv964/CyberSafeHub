const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const PlatformStat = require('../models/PlatformStat');
const ThreatLog = require('../models/ThreatLog');
const AuditLog = require('../models/AuditLog');
const Announcement = require('../models/Announcement');
const Article = require('../models/Article');
const CyberTool = require('../models/CyberTool');
const adminAuthMiddleware = require('../middleware/adminAuth');
const requireRole = require('../middleware/requireRole');
const admin = require('../config/firebaseAdmin');
const mongoose = require('mongoose');

// ─── Audit Helper ────────────────────────────────────────────────────────────────
async function writeAudit(adminEmail, action, target = null, details = null, ip = null) {
    try {
        await new AuditLog({ adminEmail, action, target, details, ip }).save();
    } catch (err) {
        console.error('Audit log write failed:', err.message);
    }
}

// ─── Role shortcut sets ───────────────────────────────────────────────────────────
const SUPER = ['super_admin'];
const SUPER_ANALYST = ['super_admin', 'analyst'];
const SUPER_SUPPORT = ['super_admin', 'support'];
const SUPER_CONTENT = ['super_admin', 'content_manager'];
const ALL_ROLES = ['super_admin', 'analyst', 'content_manager', 'support'];

// ─── Verify Admin ─────────────────────────────────────────────────────────────────
// GET /api/admin/verify — used by frontend on login / session restore
// adminAuthMiddleware already confirms admin doc exists and attaches role
router.get('/verify', adminAuthMiddleware, (req, res) => {
    res.json({ role: req.adminRole, email: req.user.email });
});

// ─── Setup Admin ─────────────────────────────────────────────────────────────────
// POST /api/admin/setup — one-time bootstrap, disabled once any admin exists
router.post('/setup', async (req, res) => {
    try {
        // Security: disable setup endpoint after first admin is created
        const existingCount = await Admin.countDocuments();
        if (existingCount > 0) {
            return res.status(403).json({ error: 'Setup is disabled. Admin accounts already exist. Use the admin panel to add more admins.' });
        }

        const { email, role } = req.body;
        if (!email) return res.status(400).json({ error: 'email is required' });

        const newAdmin = new Admin({ email, role: role || 'super_admin' });
        await newAdmin.save();
        res.status(201).json({ message: 'First admin created successfully', admin: { email: newAdmin.email, role: newAdmin.role } });
    } catch (err) {
        console.error('Admin setup error:', err);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

// ─── Admin Role Management ────────────────────────────────────────────────────────
// GET /api/admin/admins — list all admin accounts
router.get('/admins', adminAuthMiddleware, requireRole(...SUPER), async (req, res) => {
    try {
        const admins = await Admin.find({}, '-__v').lean();
        res.json({ admins });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
});

// POST /api/admin/admins — add a new admin (used instead of /setup in production)
router.post('/admins', adminAuthMiddleware, requireRole(...SUPER), async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !role) return res.status(400).json({ error: 'email and role are required' });
        if (!['super_admin', 'analyst', 'content_manager', 'support'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const existing = await Admin.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Admin already exists' });

        const newAdmin = new Admin({ email, role });
        await newAdmin.save();
        await writeAudit(req.user.email, 'ADMIN_CREATED', email, `Role: ${role}`, req.ip);
        res.status(201).json({ admin: newAdmin });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

// PATCH /api/admin/admins/:email — change an admin's role
router.patch('/admins/:email', adminAuthMiddleware, requireRole(...SUPER), async (req, res) => {
    try {
        const { role } = req.body;
        if (!['super_admin', 'analyst', 'content_manager', 'support'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const updated = await Admin.findOneAndUpdate({ email: req.params.email }, { role }, { new: true });
        if (!updated) return res.status(404).json({ error: 'Admin not found' });
        await writeAudit(req.user.email, 'ADMIN_ROLE_CHANGED', req.params.email, `New role: ${role}`, req.ip);
        res.json({ admin: updated });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update admin role' });
    }
});

// DELETE /api/admin/admins/:email — remove admin privileges
router.delete('/admins/:email', adminAuthMiddleware, requireRole(...SUPER), async (req, res) => {
    try {
        if (req.params.email === req.user.email) {
            return res.status(400).json({ error: 'Cannot remove your own admin privileges' });
        }
        const deleted = await Admin.findOneAndDelete({ email: req.params.email });
        if (!deleted) return res.status(404).json({ error: 'Admin not found' });
        await writeAudit(req.user.email, 'ADMIN_DELETED', req.params.email, null, req.ip);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete admin' });
    }
});

// ─── Stats Increment (public — called by tools) ───────────────────────────────────
router.post('/stats/increment', async (req, res) => {
    try {
        const { type } = req.body;
        const validTypes = ['filesCleaned', 'pdfsConverted', 'urlsScanned', 'passwordsChecked'];
        if (!type || !validTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid stat type' });
        }
        const today = new Date().toISOString().split('T')[0];
        await PlatformStat.findOneAndUpdate(
            { date: today },
            { $inc: { [type]: 1 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to increment stat' });
    }
});

// ─── Dashboard ────────────────────────────────────────────────────────────────────
router.get('/dashboard', adminAuthMiddleware, requireRole(...ALL_ROLES), async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let usageStats = await PlatformStat.findOne({ date: today });
        if (!usageStats) usageStats = { filesCleaned: 0, pdfsConverted: 0, urlsScanned: 0, passwordsChecked: 0 };

        const recentThreats = await ThreatLog.find().sort({ timestamp: -1 }).limit(10).lean();
        const totalThreats = await ThreatLog.countDocuments();

        let totalUsers = 0;
        try {
            const listResult = await admin.auth().listUsers(1000);
            totalUsers = listResult.users.length;
        } catch (e) { console.error('Firebase user count error:', e.message); }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const threatTrend = await ThreatLog.aggregate([
            { $match: { timestamp: { $gte: sevenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const systemMetrics = {
            database: mongoose.connection.readyState === 1 ? 'operational' : 'degraded',
            firebase: admin.apps.length > 0 ? 'operational' : 'degraded',
            apiGateway: 'operational'
        };

        res.json({ systemMetrics, usageStats, threats: recentThreats, totalThreats, totalUsers, threatTrend });
    } catch (err) {
        console.error('Dashboard data error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// ─── System Health ────────────────────────────────────────────────────────────────
router.get('/health', adminAuthMiddleware, requireRole(...ALL_ROLES), async (req, res) => {
    const results = {};

    // MongoDB
    results.mongodb = mongoose.connection.readyState === 1
        ? { status: 'operational', latencyMs: null }
        : { status: 'degraded', latencyMs: null };

    // Firebase Admin
    results.firebaseAdmin = admin.apps.length > 0
        ? { status: 'operational' }
        : { status: 'degraded', error: 'Firebase Admin not initialized' };

    // Measure admin.auth() latency
    try {
        const t0 = Date.now();
        await admin.auth().listUsers(1);
        results.firebaseAuth = { status: 'operational', latencyMs: Date.now() - t0 };
    } catch (e) {
        results.firebaseAuth = { status: 'degraded', error: e.message };
    }

    res.json(results);
});

// ─── User Manager ─────────────────────────────────────────────────────────────────
router.get('/users', adminAuthMiddleware, requireRole(...SUPER_SUPPORT), async (req, res) => {
    try {
        const { pageToken } = req.query;
        const listResult = await admin.auth().listUsers(100, pageToken || undefined);
        const users = listResult.users.map(u => ({
            uid: u.uid,
            email: u.email || '(no email)',
            displayName: u.displayName || null,
            photoURL: u.photoURL || null,
            disabled: u.disabled,
            emailVerified: u.emailVerified,
            createdAt: u.metadata.creationTime,
            lastSignIn: u.metadata.lastSignInTime,
            providerData: u.providerData.map(p => p.providerId)
        }));
        res.json({ users, nextPageToken: listResult.pageToken || null });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list users' });
    }
});

router.patch('/users/:uid', adminAuthMiddleware, requireRole(...SUPER_SUPPORT), async (req, res) => {
    try {
        const { uid } = req.params;
        const { disabled } = req.body;
        if (typeof disabled !== 'boolean') return res.status(400).json({ error: 'disabled must be a boolean' });
        await admin.auth().updateUser(uid, { disabled });
        await writeAudit(req.user.email, disabled ? 'USER_DISABLED' : 'USER_ENABLED', uid, null, req.ip);
        res.json({ success: true, uid, disabled });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

router.delete('/users/:uid', adminAuthMiddleware, requireRole(...SUPER), async (req, res) => {
    try {
        const { uid } = req.params;
        await admin.auth().deleteUser(uid);
        await writeAudit(req.user.email, 'USER_DELETED', uid, 'User permanently deleted', req.ip);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ─── Threat Intelligence ──────────────────────────────────────────────────────────
router.get('/threats', adminAuthMiddleware, requireRole(...SUPER_ANALYST), async (req, res) => {
    try {
        const { type, page = 1, limit = 20 } = req.query;
        const query = {};
        if (type && ['malware', 'phishing'].includes(type)) query.type = type;
        const total = await ThreatLog.countDocuments(query);
        const threats = await ThreatLog.find(query)
            .sort({ timestamp: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .lean();
        res.json({ threats, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch threats' });
    }
});

router.get('/threats/stats', adminAuthMiddleware, requireRole(...SUPER_ANALYST), async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const stats = await ThreatLog.aggregate([
            { $match: { timestamp: { $gte: sevenDaysAgo } } },
            { $group: { _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, type: '$type' }, count: { $sum: 1 } } },
            { $sort: { '_id.date': 1 } }
        ]);

        const labels = [], malware = [], phishing = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = d.toISOString().split('T')[0];
            labels.push(label);
            const m = stats.find(s => s._id.date === label && s._id.type === 'malware');
            const p = stats.find(s => s._id.date === label && s._id.type === 'phishing');
            malware.push(m ? m.count : 0);
            phishing.push(p ? p.count : 0);
        }
        res.json({ labels, malware, phishing });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch threat stats' });
    }
});

router.delete('/threats/:id', adminAuthMiddleware, requireRole(...SUPER_ANALYST), async (req, res) => {
    try {
        const threat = await ThreatLog.findByIdAndDelete(req.params.id);
        if (!threat) return res.status(404).json({ error: 'Threat not found' });
        await writeAudit(req.user.email, 'THREAT_DELETED', req.params.id, `${threat.type} on ${threat.target}`, req.ip);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete threat' });
    }
});

// ─── Audit Logs (read-only) ───────────────────────────────────────────────────────
router.get('/audit-logs', adminAuthMiddleware, requireRole(...SUPER), async (req, res) => {
    try {
        const { page = 1, limit = 30, format } = req.query;
        const total = await AuditLog.countDocuments();
        const logs = await AuditLog.find()
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .lean();

        if (format === 'csv') {
            const header = 'adminEmail,action,target,details,ip,timestamp';
            const rows = logs.map(l =>
                `"${l.adminEmail}","${l.action}","${l.target || ''}","${l.details || ''}","${l.ip || ''}","${l.createdAt}"`
            );
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');
            return res.send([header, ...rows].join('\n'));
        }

        res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// ─── Announcements / CMS ─────────────────────────────────────────────────────────
router.get('/announcements', adminAuthMiddleware, requireRole(...ALL_ROLES), async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 }).lean();
        res.json({ announcements });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
});

router.post('/announcements', adminAuthMiddleware, requireRole(...SUPER_CONTENT), async (req, res) => {
    try {
        const { title, body, type } = req.body;
        if (!title || !body) return res.status(400).json({ error: 'title and body are required' });
        const ann = new Announcement({ title, body, type: type || 'info', createdBy: req.user.email });
        await ann.save();
        await writeAudit(req.user.email, 'ANNOUNCEMENT_CREATED', ann._id.toString(), title, req.ip);
        res.status(201).json({ announcement: ann });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

router.patch('/announcements/:id', adminAuthMiddleware, requireRole(...SUPER_CONTENT), async (req, res) => {
    try {
        const { active } = req.body;
        const ann = await Announcement.findByIdAndUpdate(req.params.id, { active }, { new: true });
        if (!ann) return res.status(404).json({ error: 'Announcement not found' });
        await writeAudit(req.user.email, active ? 'ANNOUNCEMENT_ACTIVATED' : 'ANNOUNCEMENT_DEACTIVATED', req.params.id, ann.title, req.ip);
        res.json({ announcement: ann });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update announcement' });
    }
});

router.delete('/announcements/:id', adminAuthMiddleware, requireRole(...SUPER_CONTENT), async (req, res) => {
    try {
        const ann = await Announcement.findByIdAndDelete(req.params.id);
        if (!ann) return res.status(404).json({ error: 'Announcement not found' });
        await writeAudit(req.user.email, 'ANNOUNCEMENT_DELETED', req.params.id, ann.title, req.ip);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
});

// ─── Articles (Cyber News, Guides, Privacy) ───────────────────────────────────────
router.get('/articles', adminAuthMiddleware, requireRole(...SUPER_CONTENT), async (req, res) => {
    try {
        const { category, status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (category) query.category = category;
        if (status) query.status = status;
        const total = await Article.countDocuments(query);
        const articles = await Article.find(query)
            .sort({ updatedAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .lean();
        res.json({ articles, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

router.post('/articles', adminAuthMiddleware, requireRole(...SUPER_CONTENT), async (req, res) => {
    try {
        const { title, body, excerpt, category, tags, status } = req.body;
        if (!title || !body) return res.status(400).json({ error: 'title and body are required' });
        const article = new Article({
            title, body, excerpt: excerpt || '', category: category || 'news',
            author: req.user.email, tags: tags || [], status: status || 'draft',
            publishedAt: status === 'published' ? new Date() : null
        });
        await article.save();
        await writeAudit(req.user.email, 'ARTICLE_CREATED', article._id.toString(), title, req.ip);
        res.status(201).json({ article });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create article' });
    }
});

router.patch('/articles/:id', adminAuthMiddleware, requireRole(...SUPER_CONTENT), async (req, res) => {
    try {
        const updates = req.body;
        if (updates.status === 'published') updates.publishedAt = new Date();
        const article = await Article.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!article) return res.status(404).json({ error: 'Article not found' });
        await writeAudit(req.user.email, 'ARTICLE_UPDATED', req.params.id, article.title, req.ip);
        res.json({ article });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update article' });
    }
});

router.delete('/articles/:id', adminAuthMiddleware, requireRole(...SUPER_CONTENT), async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) return res.status(404).json({ error: 'Article not found' });
        await writeAudit(req.user.email, 'ARTICLE_DELETED', req.params.id, article.title, req.ip);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

// ─── AI Governance ────────────────────────────────────────────────────────────────
router.get('/ai/stats', adminAuthMiddleware, requireRole(...SUPER), async (req, res) => {
    try {
        const firestore = admin.firestore();
        let totalQueries = 0, queriesToday = 0, queriesThisWeek = 0, topPrompts = [];

        try {
            const statsDoc = await firestore.collection('ai_stats').doc('summary').get();
            if (statsDoc.exists) {
                const data = statsDoc.data();
                totalQueries = data.totalQueries || 0;
                queriesToday = data.queriesToday || 0;
                queriesThisWeek = data.queriesThisWeek || 0;
                topPrompts = data.topPrompts || [];
            }

            const today = new Date(); today.setHours(0, 0, 0, 0);
            const snap = await firestore.collection('ai_queries').where('timestamp', '>=', today).get();
            if (!snap.empty) queriesToday = snap.size;

            const totalSnap = await firestore.collection('ai_queries').count().get();
            if (totalSnap.data().count > 0) totalQueries = totalSnap.data().count;
        } catch (fsErr) {
            console.warn('Firestore ai_queries read failed:', fsErr.message);
        }

        res.json({ totalQueries, queriesToday, queriesThisWeek, topPrompts });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch AI stats' });
    }
});

// GET /api/admin/ai/prompts — read system prompts from Firestore
router.get('/ai/prompts', adminAuthMiddleware, requireRole(...SUPER), async (req, res) => {
    try {
        const firestore = admin.firestore();
        const snap = await firestore.collection('ai_prompts').orderBy('tool').get();
        const prompts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json({ prompts });
    } catch (err) {
        console.warn('Firestore ai_prompts read failed:', err.message);
        res.json({ prompts: [] }); // graceful empty state
    }
});

// PUT /api/admin/ai/prompts/:tool — update a system prompt
router.put('/ai/prompts/:tool', adminAuthMiddleware, requireRole(...SUPER), async (req, res) => {
    try {
        const { systemPrompt, description } = req.body;
        if (!systemPrompt) return res.status(400).json({ error: 'systemPrompt is required' });
        const firestore = admin.firestore();
        const ref = firestore.collection('ai_prompts').doc(req.params.tool);
        await ref.set({ tool: req.params.tool, systemPrompt, description: description || '', updatedAt: new Date(), updatedBy: req.user.email }, { merge: true });
        await writeAudit(req.user.email, 'AI_PROMPT_UPDATED', req.params.tool, null, req.ip);
        res.json({ success: true, tool: req.params.tool });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update AI prompt' });
    }
});


// ─── Cyber Tool Manager ─────────────────────────────────────────────────────────
// GET /api/admin/cyber-tools — list all tools (admin)
router.get('/cyber-tools', adminAuthMiddleware, requireRole(...SUPER_ANALYST), async (req, res) => {
    try {
        const tools = await CyberTool.find({}).sort({ order: 1, createdAt: 1 }).lean();
        res.json({ tools, total: tools.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tools' });
    }
});

// GET /api/admin/cyber-tools/:id — single tool
router.get('/cyber-tools/:id', adminAuthMiddleware, requireRole(...SUPER_ANALYST), async (req, res) => {
    try {
        const tool = await CyberTool.findById(req.params.id).lean();
        if (!tool) return res.status(404).json({ error: 'Tool not found' });
        res.json({ tool });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tool' });
    }
});

// POST /api/admin/cyber-tools — create a new custom tool
router.post('/cyber-tools', adminAuthMiddleware, requireRole(...SUPER), async (req, res) => {
    try {
        const { name, description, icon, emoji, color, route, isExternal, category, order, badge } = req.body;
        if (!name || !description || !route) return res.status(400).json({ error: 'name, description, and route are required' });
        const maxOrder = await CyberTool.findOne({}).sort({ order: -1 }).select('order').lean();
        const tool = new CyberTool({
            name, description,
            icon: icon || 'tool',
            emoji: emoji || '',
            color: color || 'cyan',
            route, isExternal: isExternal || false,
            category: category || 'utility',
            order: order !== undefined ? order : ((maxOrder?.order || 0) + 1),
            badge: badge || '',
            isBuiltIn: false,
            isActive: true,
        });
        await tool.save();
        await writeAudit(req.user.email, 'CYBER_TOOL_CREATED', tool._id.toString(), name, req.ip);
        res.status(201).json({ tool });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create tool' });
    }
});

// PATCH /api/admin/cyber-tools/:id — update a tool
router.patch('/cyber-tools/:id', adminAuthMiddleware, requireRole(...SUPER), async (req, res) => {
    try {
        const { name, description, icon, emoji, color, route, isExternal, category, isActive, order, badge } = req.body;
        const update = {};
        if (name !== undefined) update.name = name;
        if (description !== undefined) update.description = description;
        if (icon !== undefined) update.icon = icon;
        if (emoji !== undefined) update.emoji = emoji;
        if (color !== undefined) update.color = color;
        if (route !== undefined) update.route = route;
        if (isExternal !== undefined) update.isExternal = isExternal;
        if (category !== undefined) update.category = category;
        if (isActive !== undefined) update.isActive = isActive;
        if (order !== undefined) update.order = order;
        if (badge !== undefined) update.badge = badge;
        const tool = await CyberTool.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!tool) return res.status(404).json({ error: 'Tool not found' });
        await writeAudit(req.user.email, 'CYBER_TOOL_UPDATED', req.params.id, tool.name, req.ip);
        res.json({ tool });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update tool' });
    }
});

// DELETE /api/admin/cyber-tools/:id — delete a custom tool (built-in tools are protected)
router.delete('/cyber-tools/:id', adminAuthMiddleware, requireRole(...SUPER), async (req, res) => {
    try {
        const tool = await CyberTool.findById(req.params.id);
        if (!tool) return res.status(404).json({ error: 'Tool not found' });
        if (tool.isBuiltIn) return res.status(403).json({ error: 'Built-in tools cannot be deleted. You can disable them instead.' });
        const name = tool.name;
        await tool.deleteOne();
        await writeAudit(req.user.email, 'CYBER_TOOL_DELETED', req.params.id, name, req.ip);
        res.json({ success: true, message: `"${name}" deleted.` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete tool' });
    }
});

// PATCH /api/admin/cyber-tools/:id/reorder — update just the order field
router.patch('/cyber-tools/:id/reorder', adminAuthMiddleware, requireRole(...SUPER), async (req, res) => {
    try {
        const { order } = req.body;
        const tool = await CyberTool.findByIdAndUpdate(req.params.id, { order }, { new: true });
        if (!tool) return res.status(404).json({ error: 'Tool not found' });
        res.json({ tool });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reorder tool' });
    }
});

// ─── Academy Module Routes ─────────────────────────────────────────────────────
const AcademyModule = require('../models/AcademyModule');

// GET /api/admin/academy — list all modules (admin view, includes drafts)
router.get('/academy', adminAuthMiddleware, requireRole(...SUPER_CONTENT), async (req, res) => {
    try {
        const modules = await AcademyModule.find().sort({ order: 1, createdAt: 1 }).lean();
        res.json({ modules });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

// GET /api/admin/academy/:id
router.get('/academy/:id', adminAuthMiddleware, requireRole(...SUPER_CONTENT), async (req, res) => {
    try {
        const mod = await AcademyModule.findById(req.params.id).lean();
        if (!mod) return res.status(404).json({ error: 'Module not found' });
        res.json({ module: mod });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch module' });
    }
});

// POST /api/admin/academy — create new module
router.post('/academy', adminAuthMiddleware, requireRole(...SUPER_CONTENT), async (req, res) => {
    try {
        const { title, description, icon, category, difficulty, route, published, order } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });
        const mod = await new AcademyModule({
            title, description, icon: icon || '📚', category, difficulty,
            route: route || '', published: !!published,
            order: order || 99, isBuiltIn: false
        }).save();
        await writeAudit(req.user.email, 'ACADEMY_MODULE_CREATE', mod._id, { title }, req.ip);
        res.status(201).json({ module: mod });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create module' });
    }
});

// PATCH /api/admin/academy/:id — update module
router.patch('/academy/:id', adminAuthMiddleware, requireRole(...SUPER_CONTENT), async (req, res) => {
    try {
        const updates = req.body;
        const mod = await AcademyModule.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!mod) return res.status(404).json({ error: 'Module not found' });
        await writeAudit(req.user.email, 'ACADEMY_MODULE_UPDATE', mod._id, updates, req.ip);
        res.json({ module: mod });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update module' });
    }
});

// DELETE /api/admin/academy/:id — delete (only non-built-in)
router.delete('/academy/:id', adminAuthMiddleware, requireRole(...SUPER_CONTENT), async (req, res) => {
    try {
        const mod = await AcademyModule.findById(req.params.id);
        if (!mod) return res.status(404).json({ error: 'Module not found' });
        if (mod.isBuiltIn) return res.status(403).json({ error: 'Built-in modules cannot be deleted.' });
        await AcademyModule.findByIdAndDelete(req.params.id);
        await writeAudit(req.user.email, 'ACADEMY_MODULE_DELETE', req.params.id, { title: mod.title }, req.ip);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete module' });
    }
});

module.exports = router;
