const jwt = require('jsonwebtoken');
require('dotenv').config();
//Verifica se o  utilizador ta logado/tem o token
function verificarToken(req, res, next) {
    //tenta ler o token do header
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ error: 'Nenhum token foi apresentado.'});
    }
    //O token vem no formato "Bearer token_aqui", então precisamos separarr
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Token malformado.'});
    }

    //Verifica se o token é válido
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token falso ou expirado! Acesso negado.'});
        }
        //Se o token for válido, guarda as informações decodificadas (como userId e role) na requisição para que as rotas possam usar
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        //Permite que a requisição continue para a próxima etapa (a rota protegida)
        next(); 
    });
}
//Verifica se o utilizador é superadmin
function verificarAdmin(req, res, next) {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado! Apenas o Superadmin tem permissão para entrar aqui.'});
    }
    next();//pd passar
}

module.exports = { verificarToken,
    verificarAdmin };