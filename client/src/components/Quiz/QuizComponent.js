import React, { useState, useEffect } from 'react';
import "./quiz.css";
import API from "../../utils/API";
import {getUserId} from "../../utils/firebase";

let userQuiz = false

function CompSci(props) {
    let reqParam

    if(props.match === undefined) {
        console.log(props.id)
        reqParam = props.id
    } else {
        userQuiz = true
        console.log(props.match.params.id)
        reqParam = props.match.params.id;
    }
    
    const [cs, setCs] = useState([]);
    const correctChoice = [];

    useEffect(() => {
        if (userQuiz === false) {
            getQuizzes()
        } else {
            getUserQuiz()
        }
    }, []);

    const decodeText = (text) => {
        if (!text || !text.replace) {
            return text;
        }
        const decodedText = text.replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/<br>/g, '\n')
            .replace(/<br \/>/g, '\n')
            .replace(/<br\/>/g, '\n');
        return decodedText;
    }

    function getQuizzes() {
        API.getQuiz(reqParam).then(res => {
            console.log(res);

            if (res.data.length > 0) {
                sortQuizData(res.data)
            }
            else {
                console.log("checking for user quiz");
                ///check table for user quizes
            }
        });
    }

    function getUserQuiz () {
        console.log(reqParam)
        API.getQuizById(reqParam).then(res => {
            console.log(res)
            let quizObj =[]
            for (let i = 0; i < res.data.questions.length; i++) {
                quizObj.push({
                    question:  res.data.questions[i],
                    correct_answer: res.data.correctAnswer[i],
                    incorrect_answers: res.data.questionAnswers[i]
                })
            }
            console.log(quizObj)
            sortQuizData(quizObj)
        })
    }

    function sortQuizData(data) {
        let quiz = data.map((obj) => {
            var answers = [obj.correct_answer, ...obj.incorrect_answers]
            var randomA = []
            for (let n = answers.length; n > 0; n--) {
                let i = Math.floor(Math.random() * answers.length)

                let ans = decodeText(answers[i])

                randomA.push(ans);
                answers.splice(i, 1)
            }

            let newObj = {
                question: decodeText(obj.question),
                answers: randomA,
                correctAnswer: decodeText(obj.correct_answer)
            };

            return newObj;
        });

        setCs(quiz);
    }




    cs.forEach(e => {
        correctChoice.push(false);
    });

    function chosenAnswer(e) {
        for (let i = 0; i < cs.length; i++) {
            let correct = cs[i].correctAnswer;
            const clicked = e.target.value;
            if (clicked === correct) {
                correctChoice[i] = true;
            }
        }
    }

    function handleSubmit() {
        let score = 0;
        for (let i = 0; i < cs.length; i++) {
            if(correctChoice[i]){
                score += 10;
            }
        }
        API.submitQuiz(score, reqParam, getUserId());

        setTimeout(function(){ window.location.href = "/results" }, 1500);
    }

    return (
        <div className="spaceout">
            <div className="quiz">
                {cs.map(quiz => (
                    <div className="container" id="quizContainer">
                    <div className="card" id="questions" key={quiz.correctAnswer}>
                        <div className="card-body">
                            <h3>{quiz.question}</h3>
                            <form>
                                {quiz.answers.map(allAnswers => (
                                    <div>
                                        <input id="testing" type="radio" className="answers" value={allAnswers} name={quiz.question} onClick={chosenAnswer}/>
                                        <label>{allAnswers}</label>
                                    </div>
                                ))}
                            </form>
                        </div>
                    </div>
                    </div>
                ))}

                <button style={{margin:"20px"}} type="submit" className="btn btn-primary endQuiz" onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
}

export default CompSci;