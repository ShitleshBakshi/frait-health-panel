module.exports = {
    apps: [
        {
            name: "next-app",
            script: "node_modules/next/dist/bin/next",
            args: "start",
            instances: "1",
            exec_mode: "cluster",
            watch: false,
            env: {
                PORT: 3000,
                NODE_ENV: "production"
            }
        }
    ]
};