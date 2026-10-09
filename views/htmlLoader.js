import Toast from "../utilities/toast.js";

const HTML = {
    get: async function (path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                Toast.show("File not found: " + path)
                return Promise.reject();
            }
            const text = await response.text();

            const template = document.createElement("template");
            template.innerHTML = text.trim();
            return template.content.firstElementChild;

        } catch (err) {
            console.log(err.message);
        }
    },

    inject:function(dstContainer, srcHTML){
        if(dstContainer != null && srcHTML != null){
            dstContainer.innerHTML = "";
            dstContainer.appendChild(srcHTML);
        }
    }
}

export default HTML;