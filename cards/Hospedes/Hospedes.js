document.querySelectorAll(".fraction-control").forEach((bar) => {
    const slider = bar.querySelector('input[type="range"]');
    const text = bar.querySelector(".fraction-text");

    const updateValue = () => {
        text.textContent = `${slider.value}/${slider.max}`;
        slider.setAttribute("aria-label", `Vida: ${slider.value} de ${slider.max}`);
    };

    slider.addEventListener("input", updateValue);
    updateValue();
});
