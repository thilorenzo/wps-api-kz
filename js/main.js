// Función para cargar las marcas desde la API
const apiKey = 'J9czsFE1crN4z3oRNJXqGxaa7nxWE9CuEsDNtCKJ'; // Reemplaza con tu clave de autenticación
const logisticsCost = 11.0;
const profitMargin = 10; // Margen de ganancia del 10%
let cursor = 0;
let isReady = 0;
let itemsParcial = 0;
let itemsTotal = 0;
let listPrice = 0;
let standardDealerPrice = 0;
let profit = 0;
let profitPercentage = 0;
let inventoryTotal = 0;
let cursorNow = 0;

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
          const option = document.createElement('option');
          option.value = marca.id;
          option.textContent = marca.name;
          selectElement.appendChild(option);
        });

        if (marcaActualIndex !== -1 && marcaActualIndex < marcas.length) {
          marcaSelect.selectedIndex = marcaActualIndex;
        }
      })
      .catch(error => {
        console.error('Ocurrió un error al cargar las marcas:', error);
      });
  }
  
// Función para buscar productos basados en la marca seleccionada
function buscarProductos() {
  console.log('Esperando...');
  let h = `<h2>Esperando... </h2>`;
  
  const itemsTotalHtml = document.getElementById('itemsTotal');
  itemsTotalHtml.innerHTML = h;
  const selectedBrandId = document.getElementById('marcaSelect').value;

  let nombreMarca = obtenerNombreMarcaPorId(selectedBrandId)
  actualizarMarcaName(nombreMarca);

  // obtenerNombreMarcaPorId(selectedBrandId);
  // actualizarMarcaName(nombreMarca);

  let apiUrl = `https://api.wps-inc.com/items?include=inventory,brand,images&fields[items]=name,sku,list_price,standard_dealer_price&fields[inventory]=total&fields[brand]=name&fields[images]=domain,path,filename&filter[brand_id][eq]=${selectedBrandId}&page[size]=5000&page[cursor]=${cursor}`;

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
        const items = data.data;
        h = '<h2>'
        let ol = '';

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

      console.log(filteredResults);

      cursor = data.meta.cursor.next;
      
      if (cursor == null) {

        itemsTotal = filteredResults.length + itemsParcial

        h += `Total de items: ${itemsTotal} </h2>`;

        const itemsTotalHtml = document.getElementById('itemsTotal');
        itemsTotalHtml.innerHTML = h;


        filteredResults.forEach(item => {

          imageLink = item.images.data[0].filename

          if (item.name.toLowerCase().includes('helmet')) {
            ol += `
            <button class="card" id="card-inactive">
              <img src="https://cdn.wpsstatic.com/images/full/${imageLink}" alt="" id="product-image" />
              <div id="pages-container">
                <img src="img/ebay.png" alt="" id="pages" />
              </div>
              <p>SKU: ${item.sku}</p>
              <a href="https://www.wpsorders.com/wpsonline/o2POPOUT.pgm?ITEM=${item.sku}" target="_blank"><h3>${item.name}</h3></a>
              <p id="important-info">
                Brand: ${item.brand.data.name}
                Stock: ${item.inventory.data.total} <br />
                Profit in $us: ${"$" + (item.list_price - logisticsCost - item.standard_dealer_price).toFixed(2)} <br />
                Profit %: ${Math.round((((item.list_price - (item.list_price * 0.13)) - logisticsCost - item.standard_dealer_price)/item.list_price)*100)+'%'}
              </p>
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
            <button class="card" id="card-inactive">
              <img src="https://cdn.wpsstatic.com/images/full/${imageLink}" alt="" id="product-image" />
              <div id="pages-container">
                <img src="img/amazon.png" alt="" id="pages" />
                <img src="img/ebay.png" alt="" id="pages" />
              </div>
              <p>SKU: ${item.sku}</p>
              <a href="https://www.wpsorders.com/wpsonline/o2POPOUT.pgm?ITEM=${item.sku}" target="_blank"><h3>${item.name}</h3></a>
              <p id="important-info">
                Brand: ${item.brand.data.name}
                Stock: ${item.inventory.data.total} <br />
                Profit in $us: ${"$" + (item.list_price - logisticsCost - item.standard_dealer_price).toFixed(2)} <br />
                Profit %: ${Math.round((((item.list_price - (item.list_price * 0.13)) - logisticsCost - item.standard_dealer_price)/item.list_price)*100)+'%'}
              </p>
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

      

        const container = document.getElementById('container');
        container.innerHTML = ol;

        console.log('Listo!');

        // Reinicio contador
        itemsTotal = 0;
        itemsParcial = 0;
        cursor = 0

      } else {
        itemsParcial = filteredResults.length + itemsParcial;
        buscarProductos();
        console.log('Parcial total de items: ', itemsParcial);
        console.log('Esperando siguiente pagina');
      
      }
      })
      .catch(error => {
      console.error('Ocurrió un error al buscar productos:', error);
      });
}

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


// Cargar las marcas al cargar la página
cargarMarcas();


