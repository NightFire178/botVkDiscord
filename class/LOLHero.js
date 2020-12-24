



class Hero {
    constructor(data){
        this.data=data;
    }
    getById(id){
        for(let c in this.data ){
            if(this.data[c].id==id)return this.data[c];
            
        }
    }
    getByName(name){
        for(let c in this.data ){
            if(this.data[c].name==name)return this.data[c];
            
        }
    }
    getRandomHero(){
        return this.getById(Math.floor(Math.random() * this.data.i))
    }
}

module.exports=Hero

