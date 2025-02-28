import { v4 as uuidv4 } from 'uuid';



class Query{
    constructor( question, genre, answers){
        this.uniqueId=uuidv4();
        this.question=question;
        this.genre=genre;
        this.answers=answers;
    }
}


export{
    Query
}



