/**
 * twbschema
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

window.twbschema = (function () {
  'use strict'

  // regex to find object properties on text
  var propertyRegex = /([[(]?([\w-]+)?(_|\*)([\w-]+)?[\])]?)/g

  var gen = function (json, parentId, dotNotation) {
    var i
    // generate docs HTML
    // preset empty string
    var html = ''
    // object path
    if (!parentId) {
      // any string
      parentId = 'o'
      // root
      dotNotation = ''
    }

    // start treating schema
    // Ref.: http://json-schema.org/specification.html
    // array of required fields
    var req = json.required
    // merge all object properties
    var props = Object.assign({}, json.properties, json.patternProperties)

    // check each object property
    // one property per row
    var rowBgClass = ''
    // first row without border
    var rowBorderClass = ''
    for (var field in props) {
      if (props.hasOwnProperty(field)) {
        // new field ID for HTML elements
        var id = parentId + '-' + field

        // mark required fields
        var labelRequired = ''
        if (Array.isArray(req)) {
          for (i = 0; i < req.length; i++) {
            if (field === req[i]) {
              // field is requred
              labelRequired = '<span class="text-danger ml-2">required</span>'
              break
            }
          }
        }

        var prop = props[field]
        var type = prop.type
        if (Array.isArray(type)) {
          // use first (most important ?) type
          type = type[0]
        }
        var description
        if (prop.description) {
          // mark other refered fields on description
          description = prop.description.replace(propertyRegex, '<samp class="text-info">$1</samp>')
        } else {
          description = ''
        }

        // render optional list of field specifications
        var specsList = ''
        var addSpec = function (name, val) {
          // populate specs list
          if (val === undefined) {
            // specification value is required
            return
          }

          // eg.: minimum number, string max length...
          // samp tag HTML
          var samp
          if (Array.isArray(val) && typeof val[0] !== 'object') {
            // array of strings or numbers
            samp = ''
            for (var i = 0; i < val.length; i++) {
              if (i > 0) {
                // not first value
                samp += '<span class="text-muted mx-1"> · </span>'
              }
              samp += '<samp>' + val[i] + '</samp>'
            }
          } else {
            switch (typeof val) {
              case 'string':
              case 'number':
                samp = val
                break
              default:
                // object, boolean or null
                samp = JSON.stringify(val)
            }
            // single value
            samp = '<samp>' + samp + '</samp>'
          }

          // HTML for field spec rows
          // add li element to specs list
          specsList += '<li><span class="text-muted mr-1">' + name + ': </span>' + samp + '</li>'
        }

        if (prop.hasOwnProperty('default')) {
          // mark default value
          addSpec('Default', prop.default)
        }
        if (prop.enum) {
          // array of possible values
          addSpec('Possible values', prop.enum)
        }

        // details inside collapsible div
        // https://getbootstrap.com/docs/4.1/components/collapse/
        var objectContent = ''
        var typeLink = function () {
          // parse type string to HTML link
          // open collapse div
          type = '<a class="dropdown-toggle" data-toggle="collapse" href="#' + id + '" ' +
                 'aria-expanded="false" aria-controls="' + id + '">' + type + '</a>'
        }

        // try to handle specs for each field type
        switch (type) {
          case 'integer':
          case 'number':
            addSpec('Minimun', prop.minimum)
            addSpec('Maximum', prop.maximum)
            addSpec('Max precision', prop.multipleOf)
            break

          case 'string':
            addSpec('Min length', prop.minLength)
            addSpec('Max length', prop.maxLength)
            addSpec('Format', prop.format)
            addSpec('RegEx', prop.pattern)
            break

          case 'object':
            // link to current object properties
            typeLink()
            // render current object doc reference
            // recursive call
            // pass id and dot notation param
            objectContent = gen(prop, id, dotNotation + field + '.')
            addSpec('Min properties', prop.minProperties)
            addSpec('Max properties', prop.maxProperties)
            break

          case 'array':
            // also shows array element type
            type = type + '[' + prop.items.type + ']'
            typeLink()
            addSpec('Min elements', prop.minItems)
            addSpec('Max elements', prop.maxItems)
            break
        }

        if (specsList !== '') {
          // has specification(s)
          // setup ul element HTML
          specsList = '<ul class="small list-unstyled mt-sm-3 mb-3">' + specsList + '</ul>'
        }

        // render row HTML
        html += '<div class="px-3' + rowBorderClass + rowBgClass + '">' +
                  '<div class="row align-items-center">' +
                    '<div class="col-sm-7">' +
                      '<div class="my-3">' +
                        '<code><span class="text-secondary">' + dotNotation + '</span>' + field + '</code>' +
                        '<code class="text-muted small"><br>' + type + labelRequired + '</code>' +
                        '<div class="small">' + description + '</div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="col">' +
                      specsList +
                    '</div>' +
                  '</div>' +
                  '<div class="collapse" id="' + id + '">' +
                    '<div class="card card-body mb-3 p-1">' + objectContent + '</div>' +
                  '</div>' +
                '</div>'

        // stripped rows
        // next row class
        if (rowBgClass !== '') {
          rowBgClass = ''
        } else {
          // https://getbootstrap.com/docs/4.0/utilities/colors/
          rowBgClass = ' bg-light'
        }
        // only first row has no border
        if (rowBorderClass === '') {
          rowBorderClass = ' border-top'
        }
      }
    }

    // returns rendered HTML
    return html
  }

  var doc = function (el, schema) {
    // main function
    // receives DOM element and JSON Schema
    // parse object first
    var json, err
    if (typeof schema === 'string') {
      try {
        json = JSON.parse(schema)
      } catch (e) {
        err = e
      }
    } else if (typeof schema === 'object' && schema !== null) {
      json = schema
    } else {
      err = new Error('Schema must be a valid JSON object or string')
    }

    if (err) {
      console.error('[twbschema fatal error (invalid schema)]', err)
    } else {
      // valid
      // convert JSON Schema to docs UI
      var html = gen(json)
      if (typeof el === 'object' && el !== null && el.innerHTML) {
        el.innerHTML = html
      } else {
        // not a DOM element
        // just return HTML string
        return html
      }
    }
  }

  // return methods
  return {
    'doc': doc
  }
}())

// Sample: https://jsfiddle.net/8rzyboan/108/
