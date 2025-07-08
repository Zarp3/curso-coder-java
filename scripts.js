
const productos = ["Camiseta", "Pantalón", "Zapatillas"];
const precios = [5000, 8000, 12000];
let carrito = [];
let total = 0;

function mostrarProductos() {
    let mensaje = "Productos disponibles:\n";
    for (let i = 0; i < productos.length; i++) {
        mensaje += `${i + 1}. ${productos[i]} - $${precios[i]}\n`;
    }
    alert(mensaje);
}

function agregarAlCarrito() {
    let opcion = prompt("Ingresa el número del producto que quieres agregar al carrito (1, 2, 3):");
    opcion = parseInt(opcion);

    if (opcion >= 1 && opcion <= productos.length) {
        carrito.push(productos[opcion - 1]);
        total += precios[opcion - 1];
        alert(`Agregaste "${productos[opcion - 1]}" al carrito. Total: $${total}`);
    } else {
        alert("Opción inválida. Intenta de nuevo.");
    }
}

function mostrarCarrito() {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
    } else {
        alert(`Tu carrito: ${carrito.join(", ")}\nTotal a pagar: $${total}`);
    }
}

function iniciarSimulador() {
    alert("¡Bienvenido al simulador de tienda!");

    let continuar = true;

    while (continuar) {
        mostrarProductos();

        agregarAlCarrito();

        continuar = confirm("¿Deseás agregar otro producto?");
    }

    mostrarCarrito();
    console.log("Productos seleccionados:", carrito);
    console.log("Total final:", total);
    alert("Gracias por tu compra. ¡Hasta luego!");
}

iniciarSimulador();