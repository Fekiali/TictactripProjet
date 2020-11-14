const express = require("express");
let users = require("../User/users");
const jwt = require("jwt-simple");
const router = express.Router();


/**
* @swagger
* /api/token:
*  post:
*   tags: 
*    - Apis 
*   summary: Donner en sortie le Token de l'utilisateur
*   description: Donner en sortie le Token de l'utilisateur
*   requestBody:
*    content:
*     application/json:
*      schema:
*       type: object
*       properties:
*         email:
*           type: string
*           description: email de l'utlisateur
*           example: 'foo@bar.com'
*   responses:
*     200:
*       description: Le token est calculé avec succès
*     400: 
*       description: Vous devez saisir un email
*     404: 
*       description: L'utilisateur n'est pas enregistré dans la base de données
*/

router.post("/", function(req, res, next) {
  if (!req.body.email) {
    res.status(400).json({
      message: "Vous devez saisir un email"
    });
  } else {
      var utilisateurTrouvez = false;
      users.forEach((user)=> {
          if(user.email == req.body.email){
            utilisateurTrouvez=true;
            res.status(200).json({
                token: jwt.encode(req.body.email, "ndsvn2g8dnsb9hsg")
              });
          }
      });
      if(!utilisateurTrouvez){
        res.status(404).json({
            message: "L'utilisateur n'est pas enregistré dans la base de données"
        });
        }
  }
});

module.exports = router;
