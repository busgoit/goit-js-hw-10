import debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import './css/styles.css';

const DEBOUNCE_DELAY = 300;
const BASE_URL = 'https://restcountries.com/v3.1/name';
const FILTER_RESPONSE = 'fields=name,capital,population,flags,languages';

const input = document.querySelector('#search-box');
const countryList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');

input.addEventListener('input', debounce(onSearch, DEBOUNCE_DELAY));

function onSearch() {
  const searchQuery = input.value;

  countryList.innerHTML = '';
  countryInfo.innerHTML = '';

  fetchCountry(searchQuery);
}

function fetchCountry(country) {
  return fetch(`${BASE_URL}/${country}?${FILTER_RESPONSE}`)
    .then(takeResponse)
    .then(render)
    .catch(onError);
}

function takeResponse(response) {
  if (!response.ok) {
    throw new Error(response.status);
  }
  return response.json();
}

function render(countriesData) {
  const countriesAmount = countriesData.length;

  if (countriesAmount > 10) {
    return Notify.info('Too many matches found. Please enter a more specific name.');
  }

  if (countriesAmount >= 2 && countriesAmount <= 10) {
    return renderCountriesTable(countriesData);
  }

  renderCountryCard(countriesData);
}

function renderCountriesTable(countriesData) {
  const countriesTable = countriesData
    .map(
      country => `
      <li class="country-list__item">
        <img class="country-list__img" width="40px" height="20px"
          src="${country.flags.svg}" 
          alt="${country.name.official}"/>
        <p class="country-list__name">${country.name.official}</p>
      </li>`
    )
    .join('');

  countryList.innerHTML = countriesTable;
}

function renderCountryCard(countriesData) {
  const country = countriesData[0];

  const officialName = country.name.official;
  const capital = country.capital.join(', ');
  const population = country.population;
  const flag = country.flags.svg;
  const languages = Object.values(country.languages).join(', ');

  const countryCard = countriesData
    .map(
      country => `<div class="country-info__meta">
        <img class="country-info__img" width="70px" height="35px"
        src="${flag}" alt="${officialName}">
        <p class="country-info__name"><b>${officialName}</b></p></div>
        <p class="country-info__capital"><b>Capital: </b>${capital}</p>
        <p class="country-info__population"><b>Population: </b>${population}</p>
        <p class="country-info__languages"><b>Languages: </b>${languages}</p>`
    )
    .join('');

  countryInfo.innerHTML = countryCard;
}

function onError(error) {
  Notify.failure('Oops, there is no country with that name');
  console.log('Oops, there is no country with that name', error);
}
