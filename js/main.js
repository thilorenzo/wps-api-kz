// Función para cargar las marcas desde la API
const apiKey = 'J9czsFE1crN4z3oRNJXqGxaa7nxWE9CuEsDNtCKJ'; // Reemplaza con tu clave de autenticación
const logisticsCost = 11.0;
const profitMargin = 10; // Margen de ganancia del 10%
let cursor = 0;
let itemsParcial = 0;
let itemsTotal = 0;
let listPrice = 0;
let standardDealerPrice = 0;
let profit = 0;
let profitPercentage = 0;
let inventoryTotal = 0;
let cursorNow = 0;
let filteredProducts = []
let itemCount = 0
let h = ''
let ol = ''

const btnSiguienteMarca = document.getElementById('back');
const btnAnteriorMarca = document.getElementById('next');

let marcas = []; // Array para almacenar las marcas obtenidas del <select>
let marcaActualIndex = -1; // Índice de la marca actual seleccionada (-1 indica ninguna seleccionada inicialmente)


function cargarMarcas() {
    const apiUrl = 'https://api.wps-inc.com/brands?fields[brands]=name&sort=name&page[size]=1500';
    
    const requestOptions = {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
    };

    fetch(apiUrl, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('La solicitud no fue exitosa');
        }
        return response.json();
      })
      .then(data => {
        marcas = data.data;
        const selectElement = document.getElementById('marcaSelect');

        marcaSelect.innerHTML = '';
  
        // Llenar el select con las opciones de marca
        marcas.forEach(marca => {
          if (marca.name !== "CARDO") {
            const option = document.createElement('option');
            option.value = marca.id;
            option.textContent = marca.name;
            selectElement.appendChild(option);
          }
        });

        if (marcaActualIndex !== -1 && marcaActualIndex < marcas.length) {
          marcaSelect.selectedIndex = marcaActualIndex;
        }
      })
      .catch(error => {
        console.error('Ocurrió un error al cargar las marcas:', error);
      });
  }
  
// Función para buscar productos basados en la marca seleccionad



function buscarProductos() {

  // if (isFetching) {
  //   controller.abort();
  //   isFetching = false;
  //   console.log("Aborto");
  //   buscarProductos();
  // }

  // const abortController = React.useRef()

  // React.useEffect(() => {
  //  // If there is a pending fetch request with associated AbortController, abort
  //  if (abortController.current) {
  //    abortController.abort()
  //  }
  //  // Assign a new AbortController for the latest fetch to our useRef variable
  //  abortController.current = new AbortController()
  //  const { signal } = abortController.current });

  console.log('Esperando...');
  ol = ''

  const containerHtml = document.getElementById('container');
  containerHtml.innerHTML = ol;

  h = `<img src="img/loading.svg" alt="Loading..." width="50" height="50" id="loadingImage">`;
  
  const itemsTotalHtml = document.getElementById('itemsTotal');
  itemsTotalHtml.innerHTML = h;
  const selectedBrandId = document.getElementById('marcaSelect').value;


  let nombreMarca = obtenerNombreMarcaPorId(selectedBrandId)
  actualizarMarcaName(nombreMarca);
  obtenerNombreMarcaPorId(selectedBrandId);
  actualizarMarcaName(nombreMarca);

  
  let apiUrl = `https://api.wps-inc.com/items?include=inventory,brand,attributevalues,images&fields[items]=name,sku,list_price,standard_dealer_price&fields[inventory]=total&fields[brand]=name&fields[images]=domain,path,filename&fields[attributevalues]=name,attributekey_id&filter[brand_id][eq]=${selectedBrandId}&page[size]=15000&page[cursor]=${cursor}`;

  const requestOptions = {
      headers: {
      'Authorization': `Bearer ${apiKey}`
      }
  };


  fetch(apiUrl, requestOptions)
      .then(response => {
      if (!response.ok) {
          throw new Error('La solicitud no fue exitosa');
      }
      isFetching = true
      return response.json();
      })
      .then(data => {
        const items = data.data;
        h = '<h2>'
        ol = '';

        // Filtrar los productos que cumplen con todas las condiciones
        const filteredResults = items.filter(item => {

        if (item.inventory.data !== null) {

          if (item.inventory.data.total <= 25) {
            
            return false; // No pasa el filtro si el inventario es menor o igual a 25

          } else {
              profit = (item.list_price - (item.list_price * 0.13))  - item.standard_dealer_price - logisticsCost;
              profitPercentage = (profit / item.list_price) * 100;
          }
          
        } else {

          return false;
          
        }
        

        if (profitPercentage > profitMargin) {

          return profitPercentage

        } else {

          return false;
        }
        });


      filteredProducts.push(...filteredResults)
      console.log(filteredProducts);
      cursor = data.meta.cursor.next;
      
      if (cursor == null) {

        removeOptions(document.getElementById('filterSelect'));

        imprimirHtml(filteredProducts)
        itemsTotal = 0;
        itemsParcial = 0;
        cursor = 0
        itemCount = 0
        filteredProducts = []
        productType = []

      } else {

        itemsParcial = filteredResults.length + itemsParcial;
        buscarProductos();
        console.log('Parcial total de items: ', itemsParcial);
        console.log('Esperando siguiente pagina');
      
      }
      })
      .catch(err => {
        if (err.name == 'AbortError') { // se maneja el abort()
          console.log("Aborted!");
        } else {
          throw err;
        }
      });
}

function imprimirHtml(filteredProducts) {
  let itemProfitUs
  let itemProfitPor
  itemsTotal = filteredProducts.length

        h += `Total de items: ${itemsTotal} </h2>`;

        const itemsTotalHtml = document.getElementById('itemsTotal');
        itemsTotalHtml.innerHTML = h;
        
        let productType = []
        
        filteredProducts.forEach(item => {
          item.itemProfitUs = (item.list_price - logisticsCost - item.standard_dealer_price).toFixed(2)
          item.itemProfitPor = Math.round((((item.list_price - (item.list_price * 0.13)) - logisticsCost - item.standard_dealer_price)/item.list_price)*100)
        })

        filteredProducts.sort((itemA,itemB) => {
          return itemB.itemProfitPor - itemA.itemProfitPor;
        })

        filteredProducts.forEach(item => {
          let categoryName = ''
          for (let index = 0; index < item.attributevalues.data.length; index++) {
            if (item.attributevalues.data[index].attributekey_id == 1 ) {
              categoryName = item.attributevalues.data[index].name
              console.log(categoryName);
              categoryName = categoryName.replaceAll("/", '').replaceAll(/\s+/g, '').toLowerCase();
              console.log(categoryName);
              if (!productType.includes(item.attributevalues.data[index].name)) {
                productType.push(item.attributevalues.data[index].name)
              }
            }
          }

          if (typeof item.images.data[0]!== "undefined") {
            imageLink = item.images.data[0].filename
          } else {
            imageLink = 0
          }

          if (productType.includes("Exhaust") || productType.includes("Helmets")) {
            ol += `
            <button class="card ${categoryName}" id="card-inactive">
              <img src="https://cdn.wpsstatic.com/images/full/${imageLink}" alt="" id="product-image" />
              <div id="pages-container">
                <img src="img/ebay.png" alt="" id="pages" />
              </div>
              <p>SKU: ${item.sku}</p>
              <a href="https://www.wpsorders.com/wpsonline/o2POPOUT.pgm?ITEM=${item.sku}" target="_blank"><h3>${item.name}</h3></a>

              <p id="important-info">Brand: ${item.brand.data.name}</p>
              <p id="important-info" class="stock">Stock: ${item.inventory.data.total}</p>
              <p id="important-info">Profit in $us: ${"$" + itemProfitUs}</p>
              <p id="important-info" class="profit"> Profit %: ${itemProfitPor+'%'}</p>

              <div class="prices">
                <p id="price-text">List Price</p>
                <h3 id="price-number">$${item.list_price}</h3>
              </div>
              <div class="prices">
                <p id="price-text">Standard Price</p>
                <h3 id="price-number">$${item.standard_dealer_price}</h3>
              </div>
            </button>
          `;
          } else {
            ol += `
            <button class="card ${categoryName}" id="card-inactive">
              <img src="https://cdn.wpsstatic.com/images/full/${imageLink}" alt="" id="product-image" />
              <div id="pages-container">
                <img src="img/amazon.png" alt="" id="pages" />
                <img src="img/ebay.png" alt="" id="pages" />
              </div>
              <p>SKU: ${item.sku}</p>
              <a href="https://www.wpsorders.com/wpsonline/o2POPOUT.pgm?ITEM=${item.sku}" target="_blank"><h3>${item.name}</h3></a>
              
              <p id="important-info">Brand: ${item.brand.data.name}</p>
              <p id="important-info" class="stock">Stock: ${item.inventory.data.total}</p>
              <p id="important-info">Profit in $us: ${"$" + (item.list_price - logisticsCost - item.standard_dealer_price).toFixed(2)}</p>
              <p id="important-info" class="profit"> Profit %: ${Math.round((((item.list_price - (item.list_price * 0.13)) - logisticsCost - item.standard_dealer_price)/item.list_price)*100)+'%'}</p>
              
              <div class="prices">
                <p id="price-text">List Price</p>
                <h3 id="price-number">$${item.list_price}</h3>
              </div>
              <div class="prices">
                <p id="price-text">Standard Price</p>
                <h3 id="price-number">$${item.standard_dealer_price}</h3>
              </div>
            </button>
            `;
          }
          
        })

        const selectElement = document.getElementById('filterSelect');

        const option = document.createElement('option');
        option.value = 'Categoria';
        option.textContent = 'Categoria';
        selectElement.appendChild(option);

        productType.forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          selectElement.appendChild(option);
      });

      

        const container = document.getElementById('container');
        container.innerHTML = ol;
        console.log('Listo!');
        console.log(productType);

        // Reinicio contador

  
}

function removeOptions(selectElement) {
  var i, L = selectElement.options.length - 1;
  for(i = L; i >= 0; i--) {
     selectElement.remove(i);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const dropdownCategorias = document.getElementById('filterSelect');
  const dropdownOrden = document.getElementById('ordenSelect');
  const contenedorBotones = document.getElementById('container');

  dropdownCategorias.addEventListener('change', () => {
      let categoriaSeleccionada = dropdownCategorias.value;
      categoriaSeleccionada = categoriaSeleccionada.replaceAll("/", '').replaceAll(/\s+/g, '').toLowerCase();

      if (categoriaSeleccionada == "categoria") {
        contenedorBotones.querySelectorAll('.card').forEach(boton => {
          itemCount++
          boton.style.display = 'inline-block';
        });
      } else {
        const botones = contenedorBotones.querySelectorAll('.card');
        botones.forEach(boton => {
            boton.style.display = 'none';
        });

        // Mostrar los botones de la categoría seleccionada
        const botonesCategoria = contenedorBotones.querySelectorAll(`.${categoriaSeleccionada}`);
        botonesCategoria.forEach(boton => {
            itemCount++
            boton.style.display = 'inline-block';
        });
      }
      h = `<h2>Total de items: ${itemCount}`
      const itemsTotalHtml = document.getElementById('itemsTotal');
      itemsTotalHtml.innerHTML = h;
      itemCount = 0
  });

  dropdownOrden.addEventListener('change', () => {
    let ordenSeleccionado = dropdownOrden.value;
    console.log(ordenSeleccionado);
    botones = contenedorBotones.querySelectorAll('.card');
    botonesArray = Array.from(botones);

    botonesArray.sort((botonA, botonB) => {
      // Obtener el valor del stock y la ganancia de cada botón
      const stockA = parseInt(botonA.querySelector('.stock').textContent.replace('Stock: ', ''));
      const stockB = parseInt(botonB.querySelector('.stock').textContent.replace('Stock: ', ''));

      console.log(stockA,stockB);

      const gananciaA = parseInt(botonA.querySelector('.profit').textContent.replace('Profit %: ', '').replaceAll('%',''));
      const gananciaB = parseInt(botonB.querySelector('.profit').textContent.replace('Profit %: ', '').replaceAll('%',''));

      console.log(gananciaA,gananciaB);

      // Comparar stock o ganancia según la opción seleccionada en el dropdown
      if (ordenSeleccionado == 'stock') {
          return stockB - stockA; // Ordenar de mayor a menor stock
      } else if (ordenSeleccionado == 'profit') {
          return gananciaB - gananciaA; // Ordenar de mayor a menor ganancia
      } else {
          return 0; // No hay ordenamiento
      }
  });

  // Eliminar los botones del contenedor
  contenedorBotones.innerHTML = '';

  // Agregar los botones ordenados al contenedor
  botonesArray.forEach(boton => {
      contenedorBotones.appendChild(boton);
  });

});
});
function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("search");
  filter = input.value.toUpperCase();
  div = document.getElementById("marcaSelect");
  a = div.getElementsByTagName("option");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}



// Asociar la función buscarProductos al botón
document.getElementById('marcaSelect').addEventListener('change', () => {

  buscarProductos()

  const selectedId = marcaSelect.value; // Obtener el id seleccionado como número entero

  // Encontrar el índice de la marca seleccionada en el array 'marcas'
  const selectedMarcaIndex = marcas.findIndex(marca => marca.id == selectedId);

  // Actualizar 'marcaActualIndex' si se encontró la marca seleccionada
  if (selectedMarcaIndex !== -1) {
      marcaActualIndex = selectedMarcaIndex;
  }

});

function actualizarMarcaName(texto) {
  const marcaNameElement = document.getElementById('marcaName');
  if (marcaNameElement) {
      marcaNameElement.textContent = texto;
  } else {
      console.error('No se encontró el elemento con el ID "marcaName".');
  }
}

function obtenerNombreMarcaPorId(id) {
  // Buscar la marca en el array usando el método find()
  const marcaEncontrada = marcas.find(marca => marca.id == id);

  // Verificar si se encontró la marca
  if (marcaEncontrada) {
      return marcaEncontrada.name; // Devolver el nombre de la marca si se encontró
  } else {
      return null; // Devolver null si la marca no se encontró (o puedes manejar este caso según tu lógica)
  }
}


next.addEventListener('click', () => {
  if (marcaActualIndex < marcas.length - 1) {
      marcaActualIndex++;
      marcaSelect.selectedIndex = marcaActualIndex;
      buscarProductos();
  }
});

back.addEventListener('click', () => {
  if (marcaActualIndex < marcas.length - 1) {
      marcaActualIndex--;
      marcaSelect.selectedIndex = marcaActualIndex;
      buscarProductos();
  }
});

function filterPopup() {
  var popup = document.getElementById("popup");
  popup.classList.toggle("show");
}

// Cargar las marcas al cargar la página
cargarMarcas();


