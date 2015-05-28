//EXAMPLE
//helper function to get URL parameters.
var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();
/*------------------*/

var config;
if("config" in urlParams) {
    config = urlParams['config'];
} else {
    var config = 'example_config.json'; //random default
}

$.ajax({
    url: config,
    dataType: 'json',
    cache: false,
    error: function(data) {
        console.log(data);
    },
    success: function(data) {
        //map through multiple contracts (this includes multiple ones in 1 file + different files).
        //console.log(data);
        var total_compiled = {};
        var addresses = {}; 
        var templates = {};
        Object.keys(data["contracts"]).map(function(contract_name) { //iterate through multiple contracts based on keys
            $.ajax({
                //fetch .sol and compile it, adding compiled result & its specified address to separate dictionaries
                //3 parts: the compiled code from .sols. The address mapping. The templates.
                url: data["contracts"][contract_name].path,
                dataType: 'text',
                cache: false,
                async: false,
                success: function(contract) {
                    /*
                    This is slightly "hacky". If one file has multiple contracts, it returns one dictionary.
                    This concatenates them in the scenario where there are multiple files as well.
                    */
                    compiled = web3.eth.compile.solidity(contract);
                    Object.keys(compiled).map(function(compiled_contract_name) {
                        if(total_compiled.hasOwnProperty(compiled_contract_name) == false) { //not yet inserted
                            addresses[compiled_contract_name] = data["contracts"][compiled_contract_name].address; //not sure why I've been doing [] & . notation here.
                            templates[compiled_contract_name] = data["contracts"][compiled_contract_name].template;
                        }
                    });
                    $.extend(total_compiled, compiled);
                }
            });
        });
        console.log(total_compiled); 
        console.log(addresses); 
        console.log(templates); 
        React.render(<Reactor templates={templates} compiled={total_compiled} addresses={addresses}/>, document.getElementById('contracts'));
    }
});
