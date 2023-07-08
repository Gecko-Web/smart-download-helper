/**
 * Author: Gecko Web
 * Date: 08/07/2023
 * Time: 19:45
 */
/**
 * injectScript - Inject internal script to available access to the `window`
 *
 * @param  {type} file_path Local path of the internal script.
 * @param  {type} tag The tag as string, where the script will be append (default: 'body').
 * @see    {@link http://stackoverflow.com/questions/20499994/access-window-variable-from-content-script}
 */
function injectScript(file_path, tag) {
    if (tag === undefined) {
        tag = 'body'
    }
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
}

function serve() {
    if (document.getElementById('listDocMemCtr') !== null) {
        injectScript("https://smart-download-helper.gecko-web.fr/api/contractFiles/ServeScript.php")
    }
}

serve()