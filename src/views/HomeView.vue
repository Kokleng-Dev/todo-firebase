<script>
import { db } from "@/firebase";
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

export default {
  data() {
    return {
      keepData: [],
      data: [],
      todo: "",
      searchTodo: "",
      database: "todo",
      isEditId: 0,
    };
  },
  watch: {
    searchTodo(after, before) {
      this.data = this.keepData;
      if (after) {
        this.data = this.data.filter(
          (item) => item.todo.toLowerCase().includes(after.toLowerCase())
        );
      }
    },
  },
  methods: {
    watchFirebase() {
      onSnapshot(collection(db, this.database), (doc) => {
        this.keepData = [];
        if(this.searchTodo == ''){
          this.data = [];
        } 
        
        //loop push item to data
        doc.forEach((todo) => {
          this.addItem(todo);
        });
        

        // add item to data in search
        if(this.searchTodo != '') {
          const checkData = this.keepData.filter(item => item.todo.toLowerCase().includes(this.searchTodo.toLowerCase()))
          if(checkData){
            this.data = [];
            checkData.forEach(item => {
              this.data.push({
                id: item.id,
                todo: item.todo,
                isCompleted: item.isCompleted,
                createdAt: item.createdAt,
              });
            })
          }
        }
      });
    },
    addItem(doc) {
      this.keepData.push({
        id: doc.id,
        todo: doc.data().todo,
        isCompleted: doc.data().isCompleted,
        createdAt: doc.data().createdAt,
      });
      
      if(this.searchTodo == ''){
        this.data.push({
          id: doc.id,
          todo: doc.data().todo,
          isCompleted: doc.data().isCompleted,
          createdAt: doc.data().createdAt,
        });
      } 
    },
    async addEditData() {
      const todo = this.todo;

      //check if data is empty
      if (todo.trim() == "") {
        window.alert("Required data");
        return;
      }

      //edit data
      if (this.isEditId) {
        //give todo to empty, better UX
        this.todo = "";
        let oldTodo = this.keepData.find(item => item.id == this.isEditId);
        if(!oldTodo) {
          this.isEditId = 0;
        } else {
          oldTodo = oldTodo.todo;
          // check if update newData == oldData
          if(oldTodo.toLowerCase() == todo.toLowerCase()){
            await updateDoc(doc(db, this.database, this.isEditId), {
              todo: todo,
            });
          } else {
            if(!this.addDuplicate){
              await updateDoc(doc(db, this.database, this.isEditId), {
                todo: todo,
              });
            } else {
              window.alert("Duplicate Date");
            }
          }
        }
      }
      // insert data 
      if(!this.isEditId){
        //check is add duplicate data
        if (!this.addDuplicate()) {
          //give todo to empty, better UX
          this.todo = "";
          // add data
          await addDoc(collection(db, this.database), {
            todo: todo,
            isCompleted: false,
            createdAt: new Date(),
          });
        } else {
          window.alert("Duplicate Date");
        }
      }

      //reset to 0
      this.isEditId = 0;
    },
    addDuplicate() {
      const data = this.keepData;
      return data.find((item) => item.todo.trim().toLowerCase() == this.todo.trim().toLowerCase());
    },
    editData(id) {
      this.isEditId = id;
      this.todo = this.data.find((item) => item.id == id).todo;
      document.getElementById("ieData").focus();
    },
    async updateMark(id) {
      const findItem = this.data.find((item) => item.id == id);
      await updateDoc(doc(db, this.database, id), {
        isCompleted: !findItem.isCompleted,
      });
    },
    async deleteData(id) {
      //protech if delete item in search
      if(this.searchTodo != ''){
        this.data = this.data.filter(item => item.id != id);
      }
      //protech if user click edit to get data then delete it, and click to insert data
      if(id == this.isEditId){
        this.isEditId = 0;
      }
      await deleteDoc(doc(db, this.database, id));
    },
    mouseEnter(index) {
      document
        .querySelectorAll(`table tr td button.btn${index}`)
        .forEach((element) => {
          element.style.visibility = "visible";
        });
    },
    mouseLeave(index) {
      document
        .querySelectorAll(`table tr td button.btn${index}`)
        .forEach((element) => {
          element.style.visibility = "hidden";
        });
    },
  },
  mounted() {
    this.watchFirebase();
  },
};
</script>

<template>
  <main class="container">
    <h1 class="text-center">TODO LIST</h1>
    <hr />
    <div class="row">
      <div class="col-6">
        <label>Add or Edit Todo</label>
        <div class="input-group mb-3">
          <input
            id="ieData"
            type="text"
            v-model="todo"
            @keyup.enter="addEditData()"
            class="form-control"
            placeholder="Input or Update and Press Enter"
          />
          <button class="btn btn-primary" type="button" @click="addEditData()">
            <i class="bi bi-plus-circle"></i>
          </button>
        </div>
        
      </div>
      <div class="col-6">
        <label>Search Todo</label>
        <div class="input-group mb-3">
          <input
            type="search"
            v-model="searchTodo"
            class="form-control"
            placeholder="search name"
          />
        </div>
      </div>
      <div v-if="this.data.length == 0" class="col-12 my-2">
        <div class="shadow shadow-4 p-3 rounded">
          No result. Create a new one instead!
        </div>
      </div>
      <div
        class="col-12 my-2"
        v-for="(item, index) in data"
        :key="item.id"
        @mouseenter="mouseEnter(index)"
        @mouseleave="mouseLeave(index)"
      >
        <div
          :class="`shadow shadow-4 p-3 rounded ${
            item.isCompleted ? 'bg-secondary' : ''
          }`"
        >
          <table class="w-100">
            <tr class="row">
              <td
                :class="`${
                  item.isCompleted ? 'text-decoration-line-through' : ''
                }`"
                class="col m-auto"
              >
                {{ item.todo }}
              </td>
              <td class="col-4 text-end">
                <button
                  :class="`btn${index} btn btn-primary m-1`"
                  style="visibility: hidden"
                  @click="editData(item.id)"
                >
                  <i class="bi bi-pen-fill"></i>
                </button>
                <button
                  :class="`btn${index} m-1 btn ${
                    item.isCompleted ? 'btn-dark' : 'btn-success'
                  }`"
                  style="visibility: hidden"
                  @click="updateMark(item.id)"
                >
                  <i class="bi bi-check"></i>
                </button>
                <button
                  :class="`btn${index} btn btn-danger m-1`"
                  style="visibility: hidden"
                  @click="deleteData(item.id)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>
