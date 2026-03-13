# piso
Estado del piso

## Ejemplo: pintar el selector múltiple en el contenedor de `input[name="PRUEBA"]`

Si no puedes crear un `<div id="...">` nuevo, puedes localizar el `input` por `name` y renderizar el listado dentro de su `div` contenedor más cercano.

Además, para no colisionar con tu objeto existente `MultiField`, el siguiente ejemplo usa un nombre nuevo: `MultiSelect`.

```js
var MultiSelect = {
  ToggleItem: function (campoValores, valor, agregar) {
    let seleccionados = document
      .querySelector('[name="' + campoValores + '"]')
      .value.split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    if (agregar) {
      seleccionados.push(valor.trim());
      $('.opcionMulti.opcionMultiTodos input[type="checkbox"]').prop('checked', false);
    } else {
      seleccionados = seleccionados.filter((v) => v !== valor.trim());
    }

    seleccionados = seleccionados.filter((item, index) => seleccionados.indexOf(item) === index);
    document.querySelector('[name="' + campoValores + '"]').value = seleccionados.join(',');
  },

  ToggleTodos: function (campoValores, checked) {
    if (checked) {
      $('[name="' + campoValores + '"]').val('');
      $('.opcionMulti:not(.opcionMultiTodos) input[type="checkbox"]').prop('checked', false);
    }
  },

  ChangeIntoPruebaContainer: function (
    campoTablaValor,
    campoTablaFiltro,
    valorFiltroEqual,
    tabla,
    campoValoresSeleccionados,
    titulo,
    campoRelleno,
    opcTodos,
    ocultarValor
  ) {
    campoRelleno = campoRelleno || '';
    opcTodos = !!opcTodos;
    ocultarValor = !!ocultarValor;

    var seleccionados = $('[name="' + campoValoresSeleccionados + '"]').val().split(',');

    $.ajax({
      type: 'POST',
      url: 'Viewer.aspx/Buscador',
      data:
        '{tabla: ' +
        JSON.stringify(tabla) +
        ', campos: ' +
        JSON.stringify(
          campoTablaValor +
            (campoTablaFiltro !== '' ? ',' : '') +
            campoTablaFiltro +
            (campoRelleno !== '' ? ',' : '') +
            campoRelleno
        ) +
        ', filtro: ' +
        JSON.stringify(valorFiltroEqual) +
        ', strListFilter: "", portal: "", token: ' +
        JSON.stringify(getUrlParameter('token')) +
        ', username: ' +
        JSON.stringify(getUrlParameter('username')) +
        '}',
      contentType: 'application/json; charset=utf-8',
      success: function (data) {
        var jsonString = JSON.parse(data.d);
        var contenido =
          '<h3 style="padding:0;margin:0;color:#8C2656">' +
          titulo +
          '</h3><hr style="margin-top:5px;" />' +
          '<div style="display:block;max-height:300px;overflow-y:scroll;background:rgba(0,0,0,0.05);padding:1em;margin-top:10px;">';

        if (opcTodos) {
          contenido +=
            '<div class="opcionMulti opcionMultiTodos"><label style="display:flex;align-items:center;font-weight:bold;color:#8C2656;">' +
            '<input type="checkbox" ' +
            ($('[name="' + campoValoresSeleccionados + '"]').val() === '' ? 'checked="checked"' : '') +
            ' style="padding:0;margin:0 0.3em 0 0" onchange="MultiSelect.ToggleTodos(\'' +
            campoValoresSeleccionados +
            '\',$(this).is(\':checked\'));" />' +
            '<span>TODOS</span></label></div>';
        }

        var cant = 0;
        if (jsonString.Content.Data !== undefined) {
          for (var i = 0; i < jsonString.Content.Data.length; i++) {
            cant++;
            var seleccionado = false;
            var valor = '';
            var relleno = '';
            var linea = jsonString.Content.Data[i].Items;

            for (var j = 0; j < linea.length; j++) {
              if (campoTablaValor === linea[j].Key) {
                valor = linea[j].Value + ' ';
                if (seleccionados.indexOf(linea[j].Value) >= 0) seleccionado = true;
              }
              if (campoRelleno === linea[j].Key) {
                relleno =
                  '<span style="display:inline-block;' +
                  (ocultarValor ? '' : 'margin-left:20px') +
                  '">' +
                  linea[j].Value +
                  '</span>';
              }
            }

            contenido +=
              '<div class="opcionMulti"><label style="display:flex;align-items:center;font-weight:bold;color:#8C2656;">' +
              '<input type="checkbox" ' +
              (seleccionado ? 'checked="checked"' : '') +
              ' style="padding:0;margin:0 0.3em 0 0" onchange="MultiSelect.ToggleItem(\'' +
              campoValoresSeleccionados +
              '\',\'' +
              valor +
              '\',$(this).is(\':checked\'));" />' +
              '<span>' +
              (ocultarValor ? '' : valor) +
              relleno +
              '</span></label></div>';
          }
        }

        contenido += '</div>';
        if (cant === 0) {
          contenido = '<h3 style="padding:0;margin:0;">' + titulo + '</h3><hr style="margin-top:5px;" /><p>No hay elementos disponibles</p>';
        }

        var $inputPrueba = $('[name="PRUEBA"]').first();
        var $contenedor = $inputPrueba.closest('div');

        if ($contenedor.length === 0) {
          $contenedor = $inputPrueba.parent();
        }

        $contenedor.find('.multi-select-inline').remove();
        $contenedor.append('<div class="multi-select-inline" style="margin-top:10px;">' + contenido + '</div>');
      },
      error: function () {
        alert('Error. ¿Campo mal definido?');
      },
    });
  },
};

// Ejemplo de llamada (sin modal):
if (FormViewer.GetValue('ID_PRODUCTOS') === '') {
  MultiSelect.ChangeIntoPruebaContainer(
    'VALUE',
    'ID_CLIENTE',
    FormViewer.GetValue('ID_CLIENTE'),
    'vw_select_informes_tanques',
    'ID_TANQUES',
    'Seleccione tanque/s',
    '',
    true,
    false
  );
} else {
  MultiSelect.ChangeIntoPruebaContainer(
    'VALUE',
    'FILTRO',
    FormViewer.GetValue('ID_CLIENTE') + '#' + FormViewer.GetValue('ID_PRODUCTOS'),
    'vw_select_informes_tanques',
    'ID_TANQUES',
    'Seleccione tanque/s',
    '',
    true,
    false
  );
}
```
