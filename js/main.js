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
        const marcas = data.data;
        const selectElement = document.getElementById('marcaSelect');
  
        // Llenar el select con las opciones de marca
        marcas.forEach(marca => {
          const option = document.createElement('option');
          option.value = marca.id;
          option.textContent = marca.name;
          selectElement.appendChild(option);
        });
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
  let apiUrl = `https://api.wps-inc.com/items?include=inventory,brand&fields[items]=name,sku,list_price,standard_dealer_price&fields[inventory]=total&fields[brand]=name&filter[brand_id][eq]=${selectedBrandId}&page[size]=5000&page[cursor]=${cursor}`;

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
          ol += `
          <button class="card" id="card-inactive">
            <img src="img/product-image.png" alt="" id="product-image" />
            <div id="pages-container">
              <img src="img/amazon.png" alt="" id="pages" />
              <img src="img/ebay.png" alt="" id="pages" />
            </div>
            <p>SKU: ${item.sku}</p>
            <h3>${item.name}</h3>
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





      // if (cursor !== null) {

      //   itemsParcial = filteredResults.length + itemsParcial
      //   buscarProductos();
      //   console.log('Parcial total de items: ', itemsParcial);
      //   console.log('Esperando siguiente pagina');
        
      // } else {
        
      //   itemsTotal = filteredResults.length + itemsParcial

      //   h += `Total de items: ${itemsTotal} </h2>`;

      //   const itemsTotalHtml = document.getElementById('itemsTotal');
      //   itemsTotalHtml.innerHTML = h;

      //   filteredResults.forEach(item => {
      //     ol += `
      //     <li style="font-size: 22px;">
      //       ${item.name}

      //       <ul>
      //         <li>SKU: ${item.sku}</li>

      //         <li>Marca: ${item.brand.data.name}</li>

      //         <li>Precio de lista: ${item.list_price}</li>

      //         <li>Precio de Dealer: ${item.standard_dealer_price}</li>

      //         <li>Profit $: ${"$" + (item.list_price - logisticsCost - item.standard_dealer_price).toFixed(2)}</li>

      //         <li>Profit %: ${Math.round((((item.list_price - (item.list_price * 0.13)) - logisticsCost - item.standard_dealer_price)/item.list_price)*100)+'%'}</li>

      //         <li>Stock: ${item.inventory.data.total}</li>
      //       </ul>
      //     </li>
      //     `;
      //   })

      //   ol += '</ol>';
      

      //   const container = document.getElementById('container');
      //   container.innerHTML = ol;

      //   cursor = 1;
      //   console.log('Listo!');

      //   // Reinicio contador
      //   itemsTotal = 0;
      //   itemsParcial = 0;
      // }


      })
      .catch(error => {
      console.error('Ocurrió un error al buscar productos:', error);
      });
}



// Asociar la función buscarProductos al botón
document.getElementById('marcaSelect').addEventListener('change', buscarProductos);

// Cargar las marcas al cargar la página
cargarMarcas();
  


