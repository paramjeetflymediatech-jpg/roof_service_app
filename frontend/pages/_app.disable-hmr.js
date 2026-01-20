// This file disables Fast Refresh in development
if (typeof window !== 'undefined') {
    // Disable automatic page reloads
    if (module.hot) {
        module.hot.dispose(() => {
            // Prevent hot reload
        });
    }
}

export { };
