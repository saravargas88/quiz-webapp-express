// app.mjs
import express from 'express';
import path from 'path';
import url from 'url';
import * as fs from 'fs';
import {Query} from './query.mjs'; 

let server= null;
const app = express();
const queries=[]; 


const decorate = (answer, correct) => {
    if (correct) {
        return `<span class="correct-answer">${answer}</span>`; 
    } else {
        return `<span class="incorrect-answer">${answer}</span>`; 
    }
};
function check(id, answers) {
    const questionObj = queries.find(q => q.uniqueId === id);

    const correctAnswers = questionObj.answers.map(a => a.toLowerCase().trim());

    const decoratedAnswers = answers.map(a => {
        const cleanedAnswer = a.toLowerCase().trim();
        const isCorrect = correctAnswers.includes(cleanedAnswer);
        return decorate(a, isCorrect);  
    });
    const count = decoratedAnswers.filter(a=>!(a.includes("incorrect-answer"))).length;
    //console.log(decoratedAnswers)
    const numOfAns = correctAnswers.length;
    let status='';
    console.log(count);

    if(numOfAns===count)
    {status= "Correct";}
   else if(count===0){
        status= 'Incorrect';
    }
    else if( count < numOfAns||numOfAns===answers.length){
        status= "Partially Correct";
    }
   

    return { status, decoratedAnswers };
};




// Continue with the rest of the code
app.set('view engine', 'hbs');

const basePath = path.dirname(url.fileURLToPath(import.meta.url));
const publicPath = path.resolve(basePath, "public");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));
app.use(express.static('public'));


fs.readFile('code-samples/question-bank.json', (err, data)=>{
    const obj= JSON.parse(data);
    obj.forEach((x)=>{
     const queryy= new Query(x.question, x.genre, x.answers);
     queries.push(queryy);
    });

     server=app.listen(3000, () =>{
     console.log("Server started; type CTRL+C to shut down ");
 });
});


app.use((req, res, next) => {
    console.log(`Method: ${req.method}`);
    console.log(`Query:`, req.query);
    console.log(`Path: ${req.path}`);
 // queries.forEach(x=>console.log(x))
    next(); 
});
       
app.get('/', (req, res)=>{
    res.redirect('/quiz');

});

app.get('/questions', (req, res) => {
    let term='';
    
    if(req.query.search!==undefined){
     term= req.query.search.toLowerCase().trim();
    }
   
    const newQueries = queries.filter(q => 
        q.question.toLowerCase().includes(term)||
        q.genre.toLowerCase().includes(term)||
        q.answers.some(a=>{return a.toLowerCase().includes(term);}));
   
    res.render('questions', {queries: newQueries});
});

app.post('/questions', (req,res)=>{
    const newq= req.body;
    const toaddQuery= new Query(newq.question, newq.genre, newq.answers.split(","));
    queries.push(toaddQuery);
    res.redirect("/questions");
});

app.get("/quiz", (req, res) => {
    const num= Math.floor((Math.random()*queries.length));
   
    res.render("quiz", {question: queries[num].question, id: queries[num].uniqueId });
    
});

app.post('/quiz', (req, res) => {
    const answ= req.body.answer;
    const idquestion= req.body.id;
    const answers= answ.split(',').map(a=> a.trim());

    const { status, decoratedAnswers }= check(idquestion, answers);

    res.render("quiz", {
        question: queries.find(q => q.uniqueId === idquestion)?.question ,
        id: idquestion,
        result: status, 
        answers: answ,
        decoratedAnswers
    });
});



export{
    server, 
    app, 
    decorate
};



