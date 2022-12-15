//let { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET} = process.env;
FORGE_CLIENT_ID='3W8GR1ibd0gRNJR4JAlsPAAmQtuQs2Ji'
FORGE_CLIENT_SECRET='Meh0AImhDtNLAxp8'
if (!FORGE_CLIENT_ID || !FORGE_CLIENT_SECRET) {
    console.warn('Missing some of the environment variables.');
    process.exit(1);
}
PORT = process.env.PORT || 3000;

module.exports = {
    FORGE_CLIENT_ID,
    FORGE_CLIENT_SECRET,
    PORT
};

