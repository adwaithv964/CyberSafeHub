try {
    const vendors = require('./vendors.json');
    console.log("JSON is valid. Loaded " + Object.keys(vendors).length + " vendors.");
} catch (e) {
    console.error("JSON is invalid:", e.message);
    process.exit(1);
}
