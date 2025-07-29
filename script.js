
const productos = [
  { id: 1, nombre: "Remera", precio: 3500 },
  { id: 2, nombre: "Pantalón", precio: 7200 },
  { id: 3, nombre: "Campera", precio: 12000 },
];


const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("carrito");


let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


function mostrarProductos() {
  productos.forEach((producto) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${producto.nombre}</h3>
      <p>Precio: $${producto.precio}</p>
    `;

    const boton = document.createElement("button");
    boton.textContent = "Agregar al carrito";
    boton.addEventListener("click", () => agregarAlCarrito(producto));

    card.appendChild(boton);
    contenedorProductos.appendChild(card);
  });
}


function agregarAlCarrito(producto) {
  carrito.push(producto);
  guardarCarrito();
  mostrarCarrito();
}


function mostrarCarrito() {
  listaCarrito.innerHTML = "";
  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.nombre} - $${item.precio}`;
    listaCarrito.appendChild(li);
  });
}

// Guardar en localStorage
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Inicializar app
mostrarProductos();
mostrarCarrito();