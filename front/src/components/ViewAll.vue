<template>
  <div class="flex flex-col centered x-centered">
    <h1 class="flex centered gap-5">
      Cars CRUD page
    </h1>
    <div class="flex centered gap-5">
      <button id="create" class="button button-success" @click="action(newCar, 'create')">
        Create new
      </button>
      <input type="text" id="search-field" class="grow-1" v-model="search"/>
      <button class="button button-default"
      :disabled="oldSearch === search"
      @click="action(search, 'search')">
        Search
      </button>
    </div>
    <br>
    <div class="flex responsive-wrapper">
      <table class="cars-table" ref="carsTable">
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Description</th>
          <th>Action</th>
        </tr>
        <tr v-for="(car, index) in cars" :key="index"
        class="car-data">
          <td>{{index+1}}</td>
          <td>{{car.title}}</td>
          <td>{{car.description}}</td>
          <td class="flex gap-5 nowrap">
            <button class="button button-primary"
            :id="`edit-button-${car.id}`"
            @click="action(car, 'edit')">Edit</button>
            <button class="button button-danger"
            :id="`delete-button-${car.id}`"
            @click="action(car, 'delete')">Delete</button>
          </td>
        </tr>
        <tr>
          <td class="pagination-stats"
          colspan=4 style="text-align:center">
            <span v-if="loading">
              Loading more ...
            </span>
            <span v-else>
              Displaying 1 - {{cars.length}} out of {{total}}
            </span>
          </td>
        </tr>
      </table>
    </div>
    <FormModal
      v-if="selectedCar"
      :car="selectedCar"
      @hide="hideModal"
    />
  </div>
</template>
<script>
import axios from 'axios';
import FormModal from './FormModal.vue';

export default {
  name: 'ViewAll',
  components: {
    FormModal,
  },
  data() {
    return {
      cars: [],
      search: null,
      oldSearch: null,
      selectedCar: null,
      newCar: {
        id: -1,
        title: null,
        description: null,
      },
      page: 1,
      lastPage: 1,
      total: 30,
      loading: false,
    };
  },
  created() {
    this.requestCars();
    window.addEventListener('scroll', this.scrollHandler);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.scrollHandler);
  },
  methods: {
    requestCars() {
      this.loading = true;
      const params = new URLSearchParams(window.location.search);
      let url = `${process.env.VUE_APP_API_URL}/cars?limit=30`;
      if (this.page > 1) {
        url = `${url}&page=${this.page}`;
      }
      if (params.has('search')) {
        url = `${url}&search=${params.get('search')}`;
        this.search = params.get('search');
        this.oldSearch = this.search;
      }
      axios.get(url)
        .then((res) => {
          this.lastPage = res.data.last_page;
          this.total = res.data.total;
          this.cars.push(...res.data.data);
          this.loading = false;
        });
    },
    action(car, type) {
      if (type === 'delete') {
        // eslint-disable-next-line no-restricted-globals
        if (confirm('Are you sure?') === true) {
          axios.delete(`${process.env.VUE_APP_API_URL}/cars/${car.id}`)
            .then(() => {
              this.requestCars();
            });
        }
      } else if (type === 'search') {
        let url = `${process.env.VUE_APP_API_URL}/cars?limit=30`;
        let mark = false;
        if (this.search && this.search.length > 0) {
          url = `${process.env.VUE_APP_API_URL}/cars?limit=30&search=${this.search}`;
          mark = true;
        }
        axios.get(url)
          .then((res) => {
            this.cars = res.data.data;
            this.oldSearch = this.search;
            if (mark) {
              window.history.replaceState(null, null, `?search=${encodeURIComponent(this.search)}`);
            } else {
              window.history.replaceState({}, document.title, '/');
            }
          });
      } else if (type === 'create') {
        this.selectedCar = JSON.parse(JSON.stringify(this.newCar));
      } else { // edit
        this.selectedCar = JSON.parse(JSON.stringify(car));
      }
    },
    hideModal(newCar, type) {
      this.selectedCar = null;
      const operated = type === 'create' ? 'added' : 'updated';
      this.$nextTick(() => {
        if (newCar && newCar.title) {
          alert(`A ${newCar.title} was ${operated} successfully`);
          this.requestCars();
        }
      });
    },
    scrollHandler() {
      if (window.pageYOffset > this.$refs.carsTable.offsetTop
        && this.lastPage > this.page) {
        this.page += 1;
        this.requestCars();
      }
    },
  },
};
</script>

<style>
  .button,
  input,
  textarea {
    border: 1px solid #cdcdcd;
    border-radius: 2px;
    padding: 5px 10px;
  }
  .button:hover {
    border-color: #dedede;
  }
  .button:active {
    border-color: #ededed;
  }
  button.button-primary {
    background: #e2ebfd;
  }
  .button-default {
    background: white;
  }
</style>

<style scoped>
  button.button-danger {
    background: #ffcbcb;
  }
  button.button-success {
    background: #e5ffdc;
  }
  .grow-1 {
    flex-grow: 1;
  }
  .w-100 {
    width: 100%;
  }
  .nowrap {
    white-space: nowrap;
  }
  th {
    background: white;
    position: sticky;
    top: 0;
  }
  .flex {
    display: flex;
  }
  .flex-col {
    flex-direction: column;
  }
  .centered {
    align-items: center;
  }
  .x-centered {
    justify-content: center;
  }
  .gap-5 {
    gap: 5px;
  }
</style>
