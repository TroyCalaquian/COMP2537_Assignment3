var pokemon = [];
const numPerPage = 10;
var numPages = 0;
const numPagebtn = 5;
var filterArray = [];


const setup = async () => {
  let response = await axios.get("https://pokeapi.co/api/v2/pokemon?offset=0&limit=810");
  console.log(response.data.results);

  pokemon = response.data.results;
  numPages = Math.ceil(pokemon.length / numPerPage);

  showPage(1);

  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName');
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const types = res.data.types.map((type) => type.type.name);
    $('.modal-body').html(`
      <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" class="card-img-top" alt="...">
        <div>
          <h3>Abilites</h3>
          <ul>${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}</ul>
        </div>
        <div>
          <h3>Stats</h3>
          <ul>${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}</ul> 
        </div>
        <h3>Types</h3>
        <ul>${types.map((type) => `<li>${type}</li>`).join('')}</ul>
    `);
    $('.modal-title').html(`<h2>${res.data.name}</h2>`);
  });

  $('body').on('click', '.pagebtn', async function (e) {
    const pageNum = parseInt($(this).attr('pageNum'));
    showPage(pageNum);
  });

  $('body').on('change', '.typeFilter', async function (e) {
    var value = $(this).val(); // Assuming the checkbox value is relevant
    
    if ($(this).is(':checked')) {
      // Add the value to the array if the checkbox is checked
      filterArray.push(value);
    } else {
      // Remove the value from the array if the checkbox is unchecked
      var index = filterArray.indexOf(value);
      if (index !== -1) {
        filterArray.splice(index, 1);
      }
    }

    showPage(1);
  
    // Log the current state of the array
    console.log(filterArray);
  });
}


async function showPage(currentPage) {
  if (currentPage < 1) {
    currentPage = 1;
  }
  if (currentPage > numPages) {
    currentPage = numPages;
  }


  let innerResponse = await axios.get(`https://pokeapi.co/api/v2/type/`);
  let thisType = innerResponse.data.results;
  const type_amount = await innerResponse.data.count;
  $('#pokeTypesFilter').empty();
  for (let i = 0; i < type_amount; i++) {
    const checked = filterArray.includes(thisType[i].name) ? 'checked' : '';
    $('#pokeTypesFilter').append(`
      <input id="${thisType[i].name}" class="typeFilter" type="checkbox" name="type" value="${thisType[i].name}" ${checked}>
      <label htmlfor="${thisType[i].name}" for="${thisType[i].name}"> ${thisType[i].name} </label>
    `);
  }


  $('#pokemon').empty();
  for (let i = ((currentPage - 1) * numPerPage); i < ((currentPage - 1) * numPerPage) + numPerPage; i++) {
    let innerResponse = await axios.get(`${pokemon[i].url}`);
    let thisPokemon = innerResponse.data;
    $('#pokemon').append(`
      <div class="pokeCard card" pokeName=${thisPokemon.name}>
        <h3>${thisPokemon.name}</h3>
        <img src="${thisPokemon.sprites.front_default}" alt="${thisPokemon.name}">
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#pokeModal">More</button>
      </div>
    `);
  }

  $('#pokeTotal').empty();
  $('#pokeTotal').append(`
    <h3>Showing ${numPerPage * currentPage} of ${pokemon.length} Pokemon</h3>
  `);

  $('#pagination').empty();
  var startI = Math.max(1, currentPage - Math.floor(numPagebtn / 2));
  var endI = Math.min(numPages, currentPage + Math.floor(numPagebtn / 2));

  if (currentPage > 1) {
    $('#pagination').append(`
      <button type="button" class="pagebtn btn btn-primary" id="pagefirst" pageNum="1">First</button>
    `);
    $('#pagination').append(`
    <button type="button" class="pagebtn btn btn-primary" id="pageprev" pageNum="${currentPage-1}">Prev</button>
  `);
  }

  for (let i = startI; i <= endI; i++) {

    var active = '';
    if (i == currentPage) {
      active = 'active';
    }

    $('#pagination').append(`
      <button type="button" class="pagebtn btn btn-primary ${active}" id="page${i}" pageNum="${i}">${i}</button>
    `);
  }

  if (currentPage < numPages) {
    $('#pagination').append(`
      <button type="button" class="pagebtn btn btn-primary" id="pagenext" pageNum="${currentPage+1}">Next</button>
    `);
    $('#pagination').append(`
    <button type="button" class="pagebtn btn btn-primary" id="pagelast" pageNum="${numPages}">Last</button>
  `);
  }
}

$(document).ready(setup);
