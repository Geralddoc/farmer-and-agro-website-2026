// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.7)';
        header.style.boxShadow = 'none';
    }
});

// Dynamic counters for stats section
const statsSection = document.getElementById('stats');
const farmerCountEl = document.getElementById('farmer-count');
const processorCountEl = document.getElementById('processor-count');
let hasCounted = false;

async function fetchStats() {
    try {
        const [farmersRes, processorsRes] = await Promise.all([
            fetch('farmers import 2026.xlsx'),
            fetch('agro processors import 2026.xlsx')
        ]);

        const farmersBuffer = await farmersRes.arrayBuffer();
        const processorsBuffer = await processorsRes.arrayBuffer();

        const farmersWorkbook = XLSX.read(farmersBuffer, { type: 'array' });
        const processorsWorkbook = XLSX.read(processorsBuffer, { type: 'array' });

        const farmersCount = XLSX.utils.sheet_to_json(farmersWorkbook.Sheets[farmersWorkbook.SheetNames[0]]).length;
        const processorsCount = XLSX.utils.sheet_to_json(processorsWorkbook.Sheets[processorsWorkbook.SheetNames[0]]).length;

        // Update the target attribute for the animation
        farmerCountEl.setAttribute('data-target', farmersCount);
        processorCountEl.setAttribute('data-target', processorsCount);
    } catch (e) {
        console.error("Failed to fetch dynamic stats", e);
        // Fallback to static numbers if there's an error so it doesn't stay at 0
        farmerCountEl.setAttribute('data-target', 200);
        processorCountEl.setAttribute('data-target', 50);
    }
}

const runCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
};

const statsObserver = new IntersectionObserver(async (entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !hasCounted) {
        hasCounted = true;
        await fetchStats(); // Fetch the real data length before running the visual counter
        runCounters();
    }
}, {
    root: null,
    threshold: 0.5,
});

if (statsSection) {
    statsObserver.observe(statsSection);
}

// Simple smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80, // adjust for fixed header
                behavior: 'smooth'
            });
        }
    });
});
