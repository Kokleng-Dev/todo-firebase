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
          (item) => item.todo.trim() == after.trim()
        );
      }
    },
  },
  methods: {
    addItem(doc) {
      this.data.push({
        id: doc.id,
        todo: doc.data().todo,
        isCompleted: doc.data().isCompleted,
        createdAt: doc.data().createdAt,
      });

      this.keepData.push({
        id: doc.id,
        todo: doc.data().todo,
        isCompleted: doc.data().isCompleted,
        createdAt: doc.data().createdAt,
      });
    },
    watchFirebase() {
      onSnapshot(collection(db, this.database), (doc) => {
        this.data = [];
        doc.forEach((data) => {
          this.addItem(data);
        });
      });
    },
    addDuplicate() {
      const data = this.data;
      return this.data.find((item) => item.todo.trim() == this.todo.trim());
    },
    async addEditData() {
      const todo = this.todo;

      //check if data is empty
      if (todo.trim() == "") {
        window.alert("Required data");
        return;
      }

      // check if update newData == oldData
      if (this.isEditId) {
        let oldTodo = this.data.find(item => item.id == this.isEditId).todo;
        if(oldTodo == todo){
          this.isEditId = 0;
          this.todo = '';
          return ;
        }
      }

      // add data
      //check is add duplicate data
      if (!this.addDuplicate()) {
        //give todo to empty, better UX
        this.todo = "";

        // update data
        if(this.isEditId){
          await updateDoc(doc(db, this.database, this.isEditId), {
            todo: todo,
          });
          this.isEditId = 0;
        } 

        // add data
        else {
          await addDoc(collection(db, this.database), {
            todo: todo,
            isCompleted: false,
            createdAt: new Date(),
          });
        }
      } else {
        window.alert("Duplicate Date");
      }
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
    async deleteData(id) {
      await deleteDoc(doc(db, this.database, id));
    },
    async updateMark(id) {
      const findItem = this.data.find((item) => item.id == id);
      await updateDoc(doc(db, this.database, id), {
        isCompleted: !findItem.isCompleted,
      });
    },
    editData(id) {
      this.isEditId = id;
      this.todo = this.data.find((item) => item.id == id).todo;
      document.getElementById("ieData").focus();
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
