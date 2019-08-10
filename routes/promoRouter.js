const express = require('express');
const bodyParser = require('body-parser');
const promoRouter = express.Router();
const authenticate = require('../authenticate');

const Promotions = require('../models/promotions')

promoRouter.use(bodyParser.json());

//declaring the endpoint in one single location
promoRouter.route('/')
.get((req,res,next) => {
    Promotions.find({})
    .then((promotion) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req,res,next) => {
   Promotions.create(req.body)
   .then((promotion)=>{
        console.log('promotion created', promotion)
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
   }, (err) => next(err))
   .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req,res,next)=>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /Promotions`);
})
.delete(authenticate.verifyUser, (req,res,next)=>{
    Promotions.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

promoRouter.route('/:promoId')
.get((req,res,next)=>{
    Promotions.findById(req.params.promoId)
    .then((promotion)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
   }, (err) => next(err))
   .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req,res,next)=>{
    res.statusCode = 403;
    res.end(`POST operation not supported on /Promotions`);
})
.put(authenticate.verifyUser, (req,res,next)=>{
    Promotions.findByIdAndUpdate(req.params.promoId, {
        $set: req.body
    },{new: true})
    .then((promotion)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
   }, (err) => next(err))
   .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req,res,next)=>{
    Promotions.findByIdAndRemove(req.params.promoId)
    .then((promotion)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
   }, (err) => next(err))
   .catch((err) => next(err));
});

promoRouter.route('/:promoId/comments')
.get((req,res,next) => {
    Promotions.findById(req.params.promoId)
    .then((promotion) => {
        if(promotion != null){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(promotion.comments); 
        }  
        else{
            err = new Error('promotion ' + req.params.promoId + 'not found');
            err.status = 404;
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req,res,next) => {
   Promotions.findById(req.params.promoId)
   .then((promotion) => {
        if(promotion != null){
            promotion.comments.push(req.body)
            promotion.save()
            .then((promotion) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(promotion);
            },(err) => next(err))   
        }  
        else{
            err = new Error('promotion ' + req.params.promoId + 'not found');
            err.status = 404;
            return next(err)
        }
   }, (err) => next(err))
   .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req,res,next)=>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /Promotions/` + req.params.promoId + '/comments');
})
.delete(authenticate.verifyUser, (req,res,next)=>{
    Promotions.findById(req.params.promoId)
    .then((promotion) => {
        if(promotion != null){ 
           for(var i = (promotion.comments.lenght  -1); i >= 0; i--){
               promotion.comments.id(promotion.comments[i]._id).remove();
           }
             promotion.save()
            .then((promotion) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(promotion);
            },(err) => next(err))
        }  
        else{
            err = new Error('promotion ' + req.params.promoId + 'not found');
            err.status = 404;
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

promoRouter.route('/:Id/comments/:commentId')
.get((req,res,next)=>{
    Promotions.findById(req.params.promoId)
    .then((promotion)=>{
        if(promotion != null && promotion.comments.id(req.params.commentId) != null){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(promotion.comments.id(req.params.commentId)); 
        }  
        else if(promotion == null){
            err = new Error('promotion ' + req.params.promoId + 'not found');
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
   }, (err) => next(err))
   .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req,res,next)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /Promotions/' + '/comments/' + req.params.commentId);
})
.put(authenticate.verifyUser, (req,res,next)=>{
    Promotions.findById(req.params.promoId)
    .then((promotion)=>{
        if(promotion != null && promotion.comments.id(req.params.commentId) != null){
            if(req.body.rating){
                promotion.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if(req.body.comment){
                promotion.comments.id(req.params.commentId).comment = req.body.comment;
            }
            promotion.save()
            .then((promotion) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(promotion);
            }, (err) => next(err))   
        }  
        else if(promotion == null){
            err = new Error('promotion ' + req.params.promoId + 'not found');
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
   }, (err) => next(err))
   .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req,res,next)=>{
    Promotions.findById(req.params.promoId)
    .then((promotion) => {
        if(promotion != null && promotion.comments.id(req.params.commentId) != null){ 
            promotion.comments.id(req.params.commentId).remove();
             promotion.save()
            .then((promotion) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(promotion);
            },(err) => next(err))
        }  
        else if(promotion == null){
            err = new Error('promotion ' + req.params.promoId + 'not found');
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))   
   .catch((err) => next(err));
});


module.exports = promoRouter;