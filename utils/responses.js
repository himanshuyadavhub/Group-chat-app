// SUCCESS RESPONSE

function created(res, message, data){
    return res.status(201).json({message, data});
}

function ok(res, message, data){
    return res.status(200).json({message, data});
}

// ERROR RESPONSE

function notFound(res, message){
    return res.status(404).json({message});
}

function badRequest(res,message){
    return res.status(400).json({message});
}

function notAuthorized(res,message){
    return res.status(401).json({message});
}

function serverError(res,message){
    return res.status(500).json({message});
}


module.exports = {
    created,
    ok,
    notFound,
    notAuthorized,
    badRequest,
    serverError
}