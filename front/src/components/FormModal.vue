<template>
  <div id="form-modal" class="modal" @click="hide">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">
          <span id="modal-title-text">{{modalTitle}}</span>
          <span class="close" id="close-modal">&times;</span>
        </h2>
      </div>
      <div class="modal-body">
        <label for="title">Title</label>
        <input type="text" id="title" v-model="selfCar.title"/>
        <label for="description">Description</label>
        <textarea id="description" v-model="selfCar.description"/>
      </div>
      <p class="modal-footer">
        <button id="save" class="button button-primary"
        @click="save">Save</button>
        <button id="cancel" class="button button-default">Cancel</button>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'FormModal',
  props: {
    car: Object,
  },
  data() {
    return {
      selfCar: {
        id: null,
        title: null,
        description: null,
      },
    };
  },
  created() {
    this.selfCar = JSON.parse(JSON.stringify(this.car));
  },
  methods: {
    hide(e) {
      if (['form-modal', 'close-modal', 'cancel'].includes(e.target.id)) {
        this.$emit('hide');
      }
    },
    save() {
      const method = this.selfCar.id === -1 ? 'post' : 'patch';
      const postfix = this.selfCar.id === -1 ? '' : `/${this.selfCar.id}`;
      axios[method](
        `${process.env.VUE_APP_API_URL}/cars${postfix}`,
        this.selfCar,
      )
        .then((res) => {
          this.$emit('hide', res.data, this.selfCar.id === -1 ? 'create' : 'edit');
        });
    },
  },
  computed: {
    modalTitle() {
      let r = '';
      if (this.selfCar) {
        r = this.selfCar.id === -1 ? 'Create a new car' : 'Edit an existing car';
      }
      return r;
    },
  },
};
</script>

<style scoped>
/* The Modal (background) */
.modal {
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  padding-top: 100px; /* Location of the box */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

.modal-title {
  text-align: center;
  margin-top: 0px;
}

/* Modal Content */
.modal-content {
  position: relative;
  background-color: #fefefe;
  margin: auto;
  padding: 0;
  border: 1px solid #888;
  border-radius: 2px;
  max-width: 80%;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
  -webkit-animation-name: animatetop;
  -webkit-animation-duration: 0.3s;
  animation-name: animatetop;
  animation-duration: 0.3s
}

/* Add Animation */
@-webkit-keyframes animatetop {
  from {top:-300px; opacity:0}
  to {top:0; opacity:1}
}

@keyframes animatetop {
  from {top:-300px; opacity:0}
  to {top:0; opacity:1}
}

/* The Close Button */
.close {
  font-size: 28px;
  font-weight: bold;
  float: right;
  line-height: 33px;
}

.close:hover,
.close:focus {
  cursor: pointer;
}

.modal-header {
  padding: 16px 16px;
}

.modal-body {
  padding: 2px 16px;
  display: grid;
  grid-template-columns: 100px auto;
  align-items: center;
  gap: 5px;
}

.modal-footer {
  padding: 2px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
