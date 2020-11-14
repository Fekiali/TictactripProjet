const express = require("express");
const jwt = require("jwt-simple");
let users = require("../User/users");
const cron = require('node-cron');
const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.text());


//Compter le nombre de mots dans un text
const wordCounter = function(text) {
  let paragraphs = splittingtoParagraphs(text);
  let  wordsNumber = 0;
  paragraphs.forEach((paragraph)=>{
    words = paragraph.split(" ");
    wordsNumber += words.length;
  })
  return wordsNumber;
}


//Retourne un tableau contenant tout les paragraphes du texte pour postman et SwaggerUi
const splittingtoParagraphs = function(text) {
    var finalParagraphs = [];
    var oneParagraph = "";
    var finalParagraphs2 = [];
    var oneParagraph2 = "";
    initialParagraphs = text.split("\n");
    initialParagraphs2 = text.split("\r\n");
    initialParagraphs.forEach(element => {
        if((element == '') || (element == '\n')){
            finalParagraphs.push(oneParagraph);
            oneParagraph = '';
        }else{
            oneParagraph = oneParagraph.concat(element);
        }
    });
    finalParagraphs.push(oneParagraph);
    initialParagraphs2.forEach(element => {
        if((element == '') || (element == '\n')){
            finalParagraphs2.push(oneParagraph2);
            oneParagraph2 = '';
        }else{
            oneParagraph2 = oneParagraph2.concat(element);
        }
    });
    finalParagraphs2.push(oneParagraph2);
    if(finalParagraphs2.length < finalParagraphs.length){
        return finalParagraphs;
    }else{
        return finalParagraphs2;
    }
};


//Justification d'un seul paragraphe du text
const justifyOneParagraph = function(paragraph) {
  words = paragraph.split(" ");
  let lines = [],
    index = 0;
  while (index < words.length) {
    let letterCounted = words[index].length;
    let last = index + 1;
    //Ajouter des mots jusqu'à ce qu'on atteint une longueur de 80 caractère
    while (last < words.length) {
      if (words[last].length + letterCounted + 1 > 80) break;
      letterCounted += words[last].length + 1;
      last++;
    }
    let newLine = "";
    // Si on est sur la dernière ligne de la paragraphe
    if (last === words.length ) {
      newLine=words.slice(index).join(' ') 
    } else {
      // Determiner le nombre des espaces restants
      let RemainingSpaces = (80 - letterCounted);
      //Ajouter des espaces pour former une lignie fini
      for (let i = index; i < last; i++) {
        if(RemainingSpaces && (i<last-1)){
          newLine += words[i] + '  ';
          RemainingSpaces--;
        }else if (RemainingSpaces && (i==last-1)){
          newLine += ' ' + words[i];
        }else{
          newLine += words[i] + ' ';
        }
      }
    }
    lines.push(newLine);
    index = last;
  }
  //concatination des lignes justifiés
  let finalText = lines.join('\n')+"\n";
  return finalText;
};


//Concatination des paragraphes après leur justification et retourne le texte justifié
const justifyText = function(text) {
  let paragraphs = splittingtoParagraphs(text);
  let justifiedText = "";
  let i = 0;
  while (i < paragraphs.length) {
    formattedParagraph = justifyOneParagraph(paragraphs[i]);
    justifiedText += formattedParagraph;
    i++;
  }
  return justifiedText;
};


// Trouver l'index de l'utilisateur ayant le email passé en paramètre
const findUserIndex = function(email) {
    let i = 0;
    while (i < users.length) {
      if (email === users[i].email) {
        return i;
      }
      i++;
    }
    return null;
  };
  

/**
* @swagger
* /api/justify:
*  post:
*   security:              
*    - bearerAuth: [] 
*   tags:
*    - Apis
*   summary: Donner en sortie le text justifier
*   requestBody:
*    content:
*     text/plain:
*      schema:
*       type: string
*       example: "Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n’avais pas le temps de me dire: «Je m’endors.» Et, une demi-heure après, la pensée qu’il était temps de chercher le sommeil m’éveillait; je voulais poser le volume que je croyais avoir dans les mains et souffler ma lumière; je n’avais pas cessé en dormant de faire des réflexions sur ce que je venais de lire, mais ces réflexions avaient pris un tour un peu particulier; il me semblait que j’étais moi-même ce dont parlait l’ouvrage: une église, un quatuor, la rivalité de François Ier et de Charles-Quint.\r\n\nCette croyance survivait pendant quelques secondes à mon réveil; elle ne choquait pas ma raison, mais pesait comme des écailles sur mes yeux et les empêchait de se rendre compte que le bougeoir n’était plus allumé.\n Puis elle commençait à me devenir inintelligible, comme après la métempsycose les pensées d’une existence antérieure; le sujet du livre se détachait de moi, j’étais libre de m’y appliquer ou non; aussitôt je recouvrais la vue et j’étais bien étonné de trouver autour de moi une obscurité, douce et reposante pour mes yeux, mais peut-être plus encore pour mon esprit, à qui elle apparaissait comme une chose sans cause, incompréhensible, comme une chose vraiment obscure. Je me demandais quelle heure il pouvait être; j’entendais le sifflement des trains qui, plus ou moins éloigné, comme le chant d’un oiseau dans une forêt, relevant les distances, me décrivait l’étendue de la campagne déserte où le voyageur se hâte vers la station prochaine; et le petit chemin qu’il suit va être gravé dans son souvenir par l’excitation qu’il doit à des lieux nouveaux, à des actes inaccoutumés, à la causerie récente et aux adieux sous la lampe étrangère qui le suivent encore dans le silence de la nuit, à la douceur prochaine du retour."
*   responses:
*    200:
*     description: Le text est bien justifié
*    401: 
*     description: Non autorisé jeton non valide
*    402: 
*     description:  Payment Required
*    403: 
*     description: Non autorisé pas de jeton
*/
router.post("/", function(req, res, next) {
  const header = req.headers["authorization"];
  //Verification de l'éxistance du token
  if (typeof header !== "undefined") {
    //Extraction du token du Header
    const bearer = header.split(" ");
    const jwttoken = bearer[1];
    let decoded;
    //Verification de la validité du token
    try {
      decoded = jwt.decode(jwttoken, process.env.myJWTKey);
    } catch (e) {
      //Si token invalide
      res.status(401).json({
        message: "Non autorisé: jeton non valide"
      });
    } finally {
      if (decoded) {
        //Si token valide
        let initialText = req.body;
        let finalText = "";
        wordsNumber = wordCounter(initialText);
        let userIndex = findUserIndex(decoded);
        if (users[userIndex].wordsCounted + wordsNumber <= 80000) {
          users[userIndex].wordsCounted += wordsNumber;
          finalText = justifyText(initialText);
          res.set('Content-Type', 'text/plain');
          res.send(finalText);
        } else {
          res.status(402).json({ message: " Payment Required" });
        }
      }
    }
  } else {
    //Non disponibilité du token
    res.status(403).json({ message: "Non autorisé: pas de jeton" });
  }
});


//Remise à zero du compteur des mots quotidiennement à minuit
cron.schedule('0 0 * * *', () => {
    let i = 0;
    while (i < users.length) {
        users[i].wordsCounted = 0;
        i++;
    }
  }
);

module.exports = router;