document.addEventListener("DOMContentLoaded", function () {
    // Manejo de botones
    document.querySelectorAll(".button, .button2, .button4, .button6").forEach(button => {
        button.addEventListener("click", function () {
            alert(`Botón '${this.textContent.trim()}' clickeado.`);
        });
    });

    // Manejo de checkboxes
    document.querySelectorAll(".checkbox").forEach(checkbox => {
        checkbox.addEventListener("click", function () {
            // Alternar selección
            if (this.classList.contains("checked")) {
                this.classList.remove("checked");
                alert("Checkbox desmarcado");
            } else {
                this.classList.add("checked");
                alert("Checkbox marcado");
            }
        });
    });
});