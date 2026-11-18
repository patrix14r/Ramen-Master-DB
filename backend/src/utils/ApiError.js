// ============================================================
// ApiError.js — Error "esperado" con código HTTP
// ============================================================
// Lo lanzamos con `throw new ApiError(404, 'No encontrado')`.
// El manejador global de app.js lo convierte en una respuesta JSON
// con ese código. Los errores que NO son ApiError se tratan como 500.

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status; // código HTTP (400, 401, 404, 409...)
  }
}

module.exports = ApiError;
