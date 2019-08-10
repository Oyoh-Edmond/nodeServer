const express = require('express');
const bodyParser = require('body-parser');
const leaderRouter = express.Router();
const authenticate = require('../authenticate');
const Leaders = require('../models/Leaders');

leaderRouter.use(bodyParser.json());

//declaring the endpoint in one single location
leaderRouter.route('/')
.get((req,res,next)=>{
        Leaders.find({})
        .populate('comments.author')
        .then((leader) =>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(leader);
        }, (err) => next(err))
        .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req,res,next)=>{
    Leaders.create(req.body)
    .then((leader)=>{
         console.log('leader created', leader)
         res.statusCode = 200;
         res.setHeader('Content-Type','application/json');
         res.json(leader);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req,res,next)=>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /Leaders`);
})
.delete(authenticate.verifyUser, (req,res,next)=>{
    Leaders.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

leaderRouter.route('/:leaderId')
.get((req,res,next)=>{
    Leaders.findById(req.params.leaderId)
    .then((Leader)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(Leader);
   }, (err) => next(err))
   .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req,res,next)=>{
    res.statusCode = 403;
    res.end(`POST operation not supported on /Leaders`);
})
.put(authenticate.verifyUser, (req,res,next)=>{
    Leaders.findByIdAndUpdate(req.params.leaderId, {
        $set: req.body
    },{new: true})
    .then((Leader)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(Leader);
   }, (err) => next(err))
   .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req,res,next)=>{
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((Leader)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(Leader);
   }, (err) => next(err))
   .catch((err) => next(err));
});

leaderRouter.route('/:leaderId/comments')
.get((req,res,next) => {
    Leaders.findById(req.params.leaderId)
    .then((leader) => {
        if(leader != null){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(leader.comments); 
        }  
        else{
            err = new Error('leader ' + req.params.leaderId + 'not found');
            err.status = 404;
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req,res,next) => {
   Leaders.findById(req.params.leaderId)
   .then((leader) => {
    if(leader != null){
        leader.comments.push(req.body)
        leader.save()
        .then((leader) => {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(leader);
        },(err) => next(err))   
    }  
    else{
        err = new Error('leader ' + req.params.leaderId + 'not found');
        err.status = 404;
        return next(err)
    }
   }, (err) => next(err))
   .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req,res,next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /Leaders/' + req.params.leaderId + '/comments');
})
.delete(authenticate.verifyUser, (req,res,next)=>{
    Leaders.findById(req.params.leaderId)
    .then((leader) => {
        if(leader != null){ 
           for(var i = (leader.comments.lenght  -1); i >= 0; i--){
               leader.comments.id(leader.comments[i]._id).remove();
           }
             leader.save()
            .then((leader) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(leader);
            },(err) => next(err))
        }  
        else{
            err = new Error('leader ' + req.params.leaderId + 'not found');
            err.status = 404;
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

leaderRouter.route('/:leaderId/comments/:commentId')
.get((req,res,next)=>{
    Leaders.findById(req.params.leaderId)
    .then((leader)=>{
        if(leader != null && leader.comments.id(req.params.commentId) != null){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(leader.comments.id(req.params.commentId)); 
        }  
        else if(leader == null){
            err = new Error('leader ' + req.params.leaderId + 'not found');
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
    res.end('POST operation not supported on /Leaders/' + '/comments/' + req.params.commentId);
})
.put(authenticate.verifyUser, (req,res,next)=>{
    Leaders.findById(req.params.leaderId)
    .then((leader)=>{
        if(leader != null && leader.comments.id(req.params.commentId) != null){
            if(req.body.rating){
                leader.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if(req.body.comment){
                leader.comments.id(req.params.commentId).comment = req.body.comment;
            }
            leader.save()
            .then((leader) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(leader);
            }, (err) => next(err))   
        }  
        else if(leader == null){
            err = new Error('leader ' + req.params.leaderId + 'not found');
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
    Leaders.findById(req.params.leaderId)
    .then((leader) => {
        if(leader != null && leader.comments.id(req.params.commentId) != null){ 
            leader.comments.id(req.params.commentId).remove();
             leader.save()
            .then((leader) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(leader);
            },(err) => next(err))
        }  
        else if(leader == null){
            err = new Error('leader ' + req.params.leaderId + 'not found');
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


module.exports = leaderRouter;