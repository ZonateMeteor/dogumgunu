// storage.js - localStorage helpers
const Storage = {
  get(key, def){
    try{const v=localStorage.getItem(key);return v?JSON.parse(v):def}catch(e){return def}
  },
  set(key,val){localStorage.setItem(key,JSON.stringify(val))},
  addToArray(key,item,uniqueId='id'){
    const arr=this.get(key,[]);
    if(!arr.some(a=>a[uniqueId]===item[uniqueId])) arr.push(item);
    this.set(key,arr);
  },
  removeFromArray(key,id,uniqueId='id'){
    const arr=this.get(key,[]).filter(a=>a[uniqueId]!==id);
    this.set(key,arr);
  }
}
