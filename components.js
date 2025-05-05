// Function to load HTML components
async function loadComponent(url, containerId) {
    try {
        // Fetch the HTML content
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        
        // Insert the HTML into the container
        document.getElementById(containerId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading component from ${url}:`, error);
    }
}

// Load components when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load header and footer
    loadComponent('header.html', 'header-container');
    loadComponent('footer.html', 'footer-container');
});