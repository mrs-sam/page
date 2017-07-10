module.exports = function() {
    var hostname = window.location.hostname;

    return {
        hostname: hostname,
        hash: generateHash(),
        hrefs: grabHrefs(),
        forms: grabForms()
    };

    function generateHash() {
        return JSON.stringify(document.body.innerHTML);
    }

    function _generateStructuralDOMHash(element) {
        var openTagName = element.tagName ? `<${element.tagName}>` : '';
        var hash = openTagName;
        for (var i = 0; i < element.childNodes.length; i++) {
            hash = hash + _generateStructuralDOMHash(element.childNodes[i]);
        }
        var closeTagName = element.tagName ? `</${element.tagName}>` : '';
        hash = hash + closeTagName;
        return hash.replace(/\s{2,10}/g, ' ');
    }

    function grabHrefs() {
        var hrefs = [];
        var aLinks = document.getElementsByTagName('a');
        for (var i = 0; i < aLinks.length; i++) {
            if (aLinks[i].href)
                hrefs.push(aLinks[i].href);
        }

        return hrefs;
    }

    function grabForms() {
        var forms = new Array();
        var formTags = document.getElementsByTagName('form');
        for (var i = 0; i < formTags.length; i++) {
            var form = { formSelector: computeSelector(formTags[i]) };
            form.inputs = new Array();
            var inputTags = formTags[i].getElementsByTagName('input');
            for (var j = 0; j < inputTags.length; j++) {
                form.inputs.push({
                    selector: computeSelector(inputTags[j]),
                    name: undefined || inputTags[j].getAttribute('name'),
                    value: undefined || inputTags[j].getAttribute('value'),
                    type: undefined || inputTags[j].getAttribute('type')
                });
            }
            forms.push(form);
        }
        return forms;
    }

    function computeSelector(el) {
        var names = [];
        while (el.parentNode) {
            if (el.id) {
                names.unshift(`#${el.id}`);
                break;
            } else {
                if (el == el.ownerDocument.documentElement)
                    names.unshift(el.tagName);
                else {
                    for (var c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++);
                    names.unshift(`${el.tagName}:nth-child(${c})`);
                }
                el = el.parentNode;
            }
        }
        return names.join(' > ');
    }

};
