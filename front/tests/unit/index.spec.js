import { shallowMount, mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import App from '@/App.vue';
import ViewAll from '@/components/ViewAll.vue';
import FormModal from '@/components/FormModal.vue';

const dotenv = require('dotenv');

dotenv.config();

function generateData(number = 30) {
  const mockCarsData = [];
  for (let i = 0; i < number; i += 1) {
    const exampleData = {
      id: i + 1,
      title: faker.vehicle.model(),
      description: faker.lorem.paragraph(),
    };
    mockCarsData.push(exampleData);
  }
  return mockCarsData;
}

function getPaginatedResponse(data = [], perPage = data.length, currentPage = 1) {
  const mockPaginationObject = {
    total: data.length,
    per_page: perPage,
    current_page: currentPage,
    last_page: Math.ceil(data.length / perPage),
    first_page_url: `${process.env.VUE_APP_API_URL}?page=1`,
    last_page_url: `${process.env.VUE_APP_API_URL}?page=${Math.ceil(data.length / perPage)}`,
    next_page_url: `${process.env.VUE_APP_API_URL}?page=${currentPage + 1 <= Math.ceil(data.length / perPage) ? currentPage + 1 : currentPage}`,
    prev_page_url: null,
    path: `${process.env.VUE_APP_API_URL}`,
    from: 1,
    to: data.length > perPage ? perPage : data.length,
    data: data.length > perPage
      ? data.slice((currentPage - 1) * perPage, currentPage * perPage) : data,
  };
  const mockPaginationResponse = {
    data: mockPaginationObject,
    status: 200,
  };
  return mockPaginationResponse;
}

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
  delete window.location;
  window.location = new URL(`${process.env.VUE_APP_API_URL}`);
});

describe('testing App component', () => {
  test('App component loading the ViewAll', () => {
    const wrapper = shallowMount(App);
    const bar = wrapper.findComponent(ViewAll);
    expect(bar.exists()).toBe(true);
  });
});

describe('testing ViewAll component', () => {
  test('loads cars on component loading', async () => {
    const data = generateData();
    const response = getPaginatedResponse(data);
    jest.spyOn(axios, 'get').mockResolvedValue(response);
    const wrapper = shallowMount(ViewAll);
    expect(axios.get).toHaveBeenCalledWith(`${process.env.VUE_APP_API_URL}/cars?limit=30`);
    await flushPromises();
    const cars = wrapper.findAll('.car-data');
    expect(cars).toHaveLength(30);
  });

  test('there are action column and essential buttons', async () => {
    const wrapper = shallowMount(ViewAll);
    await flushPromises();
    const lastHeader = wrapper.findAll('th').at(-1);
    expect(lastHeader.text()).toBe('Action');
    expect(wrapper.findAll('button.button-primary').exists()).toBe(true);
    expect(wrapper.findAll('button.button-danger').exists()).toBe(true);
    expect(wrapper.findAll('button.button-success').exists()).toBe(true);
    expect(wrapper.findAll('button.button-default').exists()).toBe(true);
  });

  test('on delete button press right request is send', async () => {
    const data = generateData();
    const response = getPaginatedResponse(data);
    jest.spyOn(axios, 'get').mockResolvedValue(response);
    const wrapper = shallowMount(ViewAll);
    expect(axios.get).toHaveBeenCalledWith(`${process.env.VUE_APP_API_URL}/cars?limit=30`);
    await flushPromises();
    const firstDeleteButton = wrapper.findAll('#delete-button-1').at(0);
    jest.spyOn(axios, 'delete').mockResolvedValue('success');
    const jsDomConfirm = window.confirm;
    window.confirm = () => true;
    await firstDeleteButton.trigger('click');
    window.confirm = jsDomConfirm;
    expect(axios.delete).toHaveBeenCalledWith(`${process.env.VUE_APP_API_URL}/cars/1`);
    await flushPromises();
    expect(axios.get).toHaveBeenCalledWith(`${process.env.VUE_APP_API_URL}/cars?limit=30`);
    await flushPromises();
  });

  test('there are working search feature', async () => {
    const data = generateData();
    let response = getPaginatedResponse(data);
    jest.spyOn(axios, 'get').mockResolvedValue(response);
    const wrapper = shallowMount(ViewAll);
    expect(axios.get).toHaveBeenCalledWith(`${process.env.VUE_APP_API_URL}/cars?limit=30`);
    await flushPromises();
    const searchButton = wrapper.find('button.button-default');
    expect(searchButton.attributes('disabled')).toBe('disabled');
    const searchField = wrapper.find('input#search-field');
    expect(searchField.exists()).toBe(true);
    data[data.length - 1].description = data[data.length - 1].description.split(' ')[0];
    searchField.setValue(data[data.length - 1].description);
    expect(wrapper.vm.search).toBe(data[data.length - 1].description);
    response = getPaginatedResponse(data.slice(data.length - 1, data.length), 1);
    jest.spyOn(axios, 'get').mockResolvedValue(response);
    await flushPromises();
    expect(searchButton.text()).toBe('Search');
    expect(searchButton.attributes('disabled')).toBe(undefined);
    jest.clearAllMocks();
    searchButton.trigger('click');
    await flushPromises();
    expect(axios.get).toHaveBeenCalledWith(
      `${process.env.VUE_APP_API_URL}/cars?limit=30&search=${data[data.length - 1].description}`,
    );
    expect(wrapper.find('.cars-table').html()).toContain(data[data.length - 1].description);
  });

  test('search filter is applied on direct url access', async () => {
    const data = generateData(1);
    const response = getPaginatedResponse(data, 1);
    jest.spyOn(axios, 'get').mockResolvedValue(response);
    const locationCache = window.location;
    window.location = new URL(
      `${process.env.VUE_APP_API_URL}/cars?limit=30&search=${data[0].description.split(' ')[0]}`,
    );
    const wrapper = shallowMount(ViewAll);
    expect(axios.get).toHaveBeenCalledWith(
      `${process.env.VUE_APP_API_URL}/cars?limit=30&search=${data[0].description.split(' ')[0]}`,
    );
    window.location = locationCache;
    await flushPromises();
    expect(wrapper.find('.cars-table').html()).toContain(data[0].description.split(' ')[0]);
  });

  test('form modal is showning and closing properly', async () => {
    const data = generateData();
    const response = getPaginatedResponse(data);
    jest.spyOn(axios, 'get').mockResolvedValue(response);
    const wrapper = mount(ViewAll);
    expect(axios.get).toHaveBeenCalledWith(`${process.env.VUE_APP_API_URL}/cars?limit=30`);
    await flushPromises();
    // modal should be invisible by default
    let formModal = wrapper.findComponent(FormModal);
    expect(formModal.exists()).toBe(false);
    // testing that modal has all needed titles, fields and buttons
    wrapper.find('button#create').trigger('click');
    await flushPromises();
    formModal = wrapper.findComponent(FormModal);
    expect(formModal.exists()).toBe(true);
    expect(formModal.isVisible()).toBe(true);
    expect(formModal.find('#modal-title-text').text()).toBe('Create a new car');
    expect(formModal.find('button#cancel').text()).toBe('Cancel');
    expect(formModal.find('button#save').text()).toBe('Save');
    expect(formModal.find('input#title').exists()).toBe(true);
    expect(formModal.find('textarea#description').exists()).toBe(true);
    // testing that modal will close on cross icon click
    formModal.find('span#close-modal').trigger('click');
    await flushPromises();
    formModal = wrapper.findComponent(FormModal);
    expect(formModal.exists()).toBe(false);
    // testing that modal will close on grey area click
    wrapper.find('button#create').trigger('click');
    await flushPromises();
    formModal = wrapper.findComponent(FormModal);
    expect(formModal.isVisible()).toBe(true);
    formModal.find('div#form-modal').trigger('click');
    await flushPromises();
    formModal = wrapper.findComponent(FormModal);
    expect(formModal.exists()).toBe(false);
  });

  test('create new car feature works', async () => {
    const data = generateData();
    let response = getPaginatedResponse(data);
    jest.spyOn(axios, 'get').mockResolvedValue(response);
    const wrapper = mount(ViewAll);
    expect(axios.get).toHaveBeenCalledWith(`${process.env.VUE_APP_API_URL}/cars?limit=30`);
    await flushPromises();
    wrapper.find('button#create').trigger('click');
    await flushPromises();
    const formModal = wrapper.findComponent(FormModal);
    const newCar = {
      id: -1,
      title: faker.vehicle.model(),
      description: faker.lorem.paragraph(),
    };
    formModal.find('input#title').setValue(newCar.title);
    formModal.find('textarea#description').setValue(newCar.description);
    await flushPromises();
    expect(formModal.vm.selfCar.id).toBe(-1);
    expect(formModal.vm.selfCar.title).toBe(newCar.title);
    expect(formModal.vm.selfCar.description).toBe(newCar.description);
    jest.clearAllMocks();
    response = {
      statusText: 'Text',
      status: 201,
      data: newCar,
    };
    jest.spyOn(axios, 'post').mockResolvedValue(response);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    // const data = generateData();
    response = getPaginatedResponse(data);
    jest.spyOn(axios, 'get').mockResolvedValue(response);
    formModal.find('button#save').trigger('click');
    await flushPromises();
    expect(axios.post).toHaveBeenCalledWith(
      `${process.env.VUE_APP_API_URL}/cars`,
      newCar,
    );
    expect(formModal.exists()).toBe(false);
    expect(window.alert).toBeCalledWith(`A ${newCar.title} was added successfully`);
    expect(axios.get).toHaveBeenCalledWith(`${process.env.VUE_APP_API_URL}/cars?limit=30`);
  });

  test('edit existing car feature works', async () => {
    const data = generateData();
    let response = getPaginatedResponse(data);
    jest.spyOn(axios, 'get').mockResolvedValue(response);
    const wrapper = mount(ViewAll);
    expect(axios.get).toHaveBeenCalledWith(`${process.env.VUE_APP_API_URL}/cars?limit=30`);
    await flushPromises();
    wrapper.findAll('#edit-button-30').at(0).trigger('click');
    await flushPromises();
    const formModal = wrapper.findComponent(FormModal);
    data[29].description = `${data[29].description
      .substring(0, data[29].description.length - 1)} 123`;
    formModal.find('input#title').setValue(data[29].title);
    formModal.find('textarea#description').setValue(data[29].description);
    await flushPromises();
    expect(formModal.vm.selfCar.id).toBe(data[29].id);
    expect(formModal.vm.selfCar.title).toBe(data[29].title);
    expect(formModal.vm.selfCar.description).toBe(data[29].description);
    jest.clearAllMocks();
    response = {
      statusText: 'Text',
      status: 201,
      data: data[29],
    };
    jest.spyOn(axios, 'patch').mockResolvedValue(response);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    const editedCar = JSON.parse(JSON.stringify(data[29]));
    response = getPaginatedResponse(data);
    jest.spyOn(axios, 'get').mockResolvedValue(response);
    formModal.find('button#save').trigger('click');
    await flushPromises();
    expect(axios.patch).toHaveBeenCalledWith(
      `${process.env.VUE_APP_API_URL}/cars/30`,
      editedCar,
    );
    expect(formModal.exists()).toBe(false);
    expect(window.alert).toBeCalledWith(`A ${editedCar.title} was updated successfully`);
    expect(axios.get).toHaveBeenCalledWith(`${process.env.VUE_APP_API_URL}/cars?limit=30`);
    expect(wrapper.find('.cars-table').html()).toContain(editedCar.description);
  });

  test('there are pagination working on each scroll down', async () => {
    const data = generateData(100);
    let response = getPaginatedResponse(data, 30, 1);
    jest.spyOn(axios, 'get').mockResolvedValue(response);
    const wrapper = shallowMount(ViewAll);
    expect(axios.get).toHaveBeenCalledWith(`${process.env.VUE_APP_API_URL}/cars?limit=30`);
    await flushPromises();
    expect(wrapper.find('.pagination-stats').exists()).toBe(true);
    expect(wrapper.find('.cars-table').html().indexOf(data[31].description) === -1).toBe(true);
    /* eslint-disable no-await-in-loop */
    for (let i = 2; i < 5; i += 1) {
      response = getPaginatedResponse(data, 30, i);
      jest.spyOn(axios, 'get').mockResolvedValue(response);
      jest.clearAllMocks();
      window.pageYOffset = 100;
      wrapper.vm.scrollHandler();
      await flushPromises();
      expect(axios.get).toHaveBeenCalledWith(`${process.env.VUE_APP_API_URL}/cars?limit=30&page=${i}`);
      expect(wrapper.find('.cars-table').html()).toContain(data[(i - 1) * 30 + 1].description);
    }
    /* eslint-enable no-await-in-loop */
    window.pageYOffset = 0;
  });
});
