import React from "react";

const Plugin = () => {
  return (
    //  <div class="container mx-auto px-4 flex justify-center ">
    //   <div class="p-4 my-5 bg-gray-100 rounded-lg shadow-md sm:p-8 dark:bg-gray-600 dark:border-gray-700 mobile:container">

    //     <div class="flex justify-between items-center mb-5">
    //       <div>
    //         <a href="/plugins/" class="text-white dark:text-gray-800 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none
    //           focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5
    //           text-center mr-3 md:mr-0 dark:bg-green-400 dark:hover:bg-green-500 dark:focus:ring-green-800 flex items-center"
    //         >
    //           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    //             <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
    //           </svg>
    //           Back to plugins
    //         </a>
    //       </div>
    //     </div>

    //     {/* <h1 class="mb-5 text-3xl font-bold leading-none text-gray-900 dark:text-white">{{ plugin.name }} plugin</h1> */}

    //     <div class="max-w-2/3 gap-y-5 gap-y-10 divide-gray-200 dark:divide-gray-700 flex flex-wrap text-gray-800 dark:text-gray-400">
    //       {/* {{ plugin.description }} */}
    //     </div>

    //     <article class="prose dark:prose-invert py-5 lg:prose-l ">
    //       {/* {{{ descriptionFull }}}
    //     </article> */}
    //     <div>
    //       <h2 class="text-3xl mb-10 font-bold leading-none text-gray-900 dark:text-white">Configure plugin</h2>

    //       <form id="plugin_form" method="POST"/>
    //       {/* {{#each params}}
    //         {{#if (eq this.type 'text' )}} */}
    //           <div class="mb-6">
    //             {/* <label for="inp_{{ this.id }}" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">{{ this.name }}</label> */}
    //             {/* <textarea name="{{ this.inputName }}" id="inp_{{ this.id }}" rows="3"
    //               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    //               {{#if this.required}}required{{/if}}
    //             >{{this.value}}
    //             </textarea> */}
    //           </div>
    //         {/* {{/if }}
    //         {{#if (eq this.type 'str' )}} */}
    //           <div class="mb-6">
    //             {/* <label for="inp_{{ this.id }}" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">{{ this.name }}</label> */}
    //             <input name="{{ this.inputName }}"
    //               id="inp_{{ this.id }}"
    //               value="{{this.value}}"
    //               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    //             //   {{#if this.required}}required{{/if}}
    //             //   {{#if this.inputType}}type="{{ this.inputType }}"{{else}}type="text"{{/if}}
    //             />
    //             {/* {{#if this.notes }} */}
    //               {/* <div class="text-xs text-gray-500 dark:text-gray-400">{{ this.notes }} </div> */}
    //             {/* {{/if }} */}
    //           </div>
    //         {/* // {{/if }}
    //         // {{#if (eq this.type 'bool' )}}
    //           <div class="mb-6"> */}
    //             {/* <label for="inp_{{ this.id }}" class="relative inline-flex items-center mb-4 cursor-pointer">
    //               <input
    //                 name="{{ this.inputName }}"
    //                 type="checkbox"
    //                 {{#if this.value}}checked{{/if}}
    //                 value="true"
    //                 id="inp_{{ this.id }}"
    //                 class="sr-only peer"
    //               > */}
    //               {/* <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    //               <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{{ this.name }}</span>
    //             </label> */}
    //           </div>
    //         {/* {{/if }}
    //         {{#if (eq this.type 'dropdown' )}}
    //           <div class="mb-6"> */}
    //             <label for="inp_{{ this.id }}" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Select an option</label>
    //             <select id="inp_{{ this.id }}" value="{{ this.value }}" id="countries" name="{{ this.inputName }}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
    //               {{#each this.values}}
    //                 <option value="{{this.value}}" {{#if (eq ../value this.value ) }}selected{{/if}}>{{ this.label }}</option>
    //               {{/each }}
    //             </select>
    //           </div>
    //         {{/if }}

    //       {{/each}}
    //       <div class="flex items-center ">
    //         <button id="save" type="button" onclick="onSubmit(notify = false)" class="text-white dark:text-gray-800 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none
    //               focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 dark:bg-green-400 dark:hover:bg-green-500 dark:focus:ring-green-800 flex items-center">
    //             {{#if pluginSettings.enabled}}
    //               Save settings
    //             {{else}}
    //               Enable Plugin
    //             {{/if}}
    //         </button>
    //         <button id="save_notify" type="button" onclick="onSubmit(notify = true)"
    //           class="text-white ml-4 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg
    //           text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
    //             {{#if pluginSettings.enabled}}
    //               Save & Send test notification
    //             {{else}}
    //               Enable & Send test notification
    //             {{/if}}
    //         </button>
    //       </div>
    //       </form>
    //     </div>

    //   </div>
    // </div>

    <div
      id="toast-saved"
      class=" fixed right-2 bottom-2 hidden flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-green-900 dark:bg-green-100"
      role="alert"
    >
      <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-100 dark:text-green-900">
        <svg
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </div>
      <div class="ml-3 text-sm font-normal">Test notification sent</div>
      <button
        type="button"
        class="bg-transparent ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 dark:text-green-900 dark:hover:text-black "
        onclick="hideToast()"
        aria-label="Close"
      >
        <span class="sr-only">Close</span>
        <svg
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </button>
    </div>
  );
};

{
  /* <script>
  const notification = document.getElementById('notification');
  const plugin_form = document.getElementById("plugin_form");
  const save = document.getElementById("save");
  const save_notify = document.getElementById("save_notify");

  function hideToast() {
    document.getElementById('toast-saved').classList.add('hidden');
  }

  function showToast() {
    document.getElementById('toast-saved').classList.remove('hidden');
    setTimeout(hideToast, 5000);

  }

  async function postPlugin(data) {
    const url = window.location.href;
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      redirect: 'manual',
    })}

  const onSubmit = async (notify) => {
    event.preventDefault();
    const formData = new FormData(plugin_form);
    const fromValues = Object.fromEntries(formData);

    if (notify) {
      fromValues.notify = true;
    } else {
      fromValues.notify = false;
    }
    await postPlugin(fromValues)
      .catch(err => console.log(err));

    if (!notify) {
     window.location = "/plugins/" 
    } else {
      showToast();
      save.textContent = 'Save settings'; 
      save_notify.textContent = 'Save & Send test notification';
    }
}

</script> */
}

export default Plugin;
