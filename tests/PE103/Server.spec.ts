import 'mocha'
import { expect } from 'chai'
import request from 'request';


describe('--Pruebas de API del Clima--', () => {
  it('debería retornar un objeto con información del clima.', (done) => {
    request.get('http://localhost:3000/weather?location="Tenerife, Spain"', (error, response, body) => {
      const result = JSON.parse(body);
      expect(response.statusCode).to.equal(200);
      expect(result).to.be.an('object');
      expect(result).to.have.property('location');
      expect(result.location.name).to.be.equal('Tenerife');
      expect(result).to.have.property('current');
      expect(result.current).to.have.property('temperature');
      expect(result.current.temperature).to.be.equal(20);
      done();
    });
  });

  it('debería retornar un error 500 si la ubicación no existe', (done) => {
    request.get('http://localhost:3000/weather?location=ErrorLocalizacion', (error, response, body) => {
      const result = JSON.parse(body);
      expect(response.statusCode).to.equal(500);
      expect(result).to.be.an('object');
      expect(result).to.have.property('error');
      done();
    });
  });

  it('debería retornar un error 404 si la ruta no existe', (done) => {
    request.get('http://localhost:3000/nonexistingroute', (error, response, body) => {
      const result = JSON.parse(body);
      expect(response.statusCode).to.equal(404);
      expect(result).to.be.an('object');
      expect(result).to.have.property('error');
      done();
    });
  });
});