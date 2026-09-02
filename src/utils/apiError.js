/**
 * Distingue "el servidor no contesta" de "el servidor contestó que no".
 *
 * Sin `response` el request nunca llegó a destino: red caída, DNS, CORS mal
 * configurado, timeout o el backend dormido. Los 502/503/504 sí traen respuesta,
 * pero vienen del proxy y significan lo mismo para el usuario.
 *
 * Importa la diferencia: un 404 en /propuesta/:token es un link inválido y hay
 * que decirlo así, mientras que un fallo de conexión es un problema nuestro.
 */
export function isConnectionError(err) {
  if (!err) return false
  if (!err.response) return true
  return [502, 503, 504].includes(err.response.status)
}
