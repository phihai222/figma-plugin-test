// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 300, height: 200 });


function getNodeInfo(node: SceneNode): any {
    // Tạo đối tượng chứa thông tin của node hiện tại
    const nodeInfo: any = {
        id: node.id,
        name: node.name,
        type: node.type,
        x: node.x,
        y: node.y,
        children: []
    };

    if ("width" in node && "height" in node) {
        nodeInfo.width = node.width;
        nodeInfo.height = node.height;
    }

    if ("children" in node && Array.isArray(node.children)) {
        nodeInfo.children = node.children.map(child => getNodeInfo(child));  // Đệ quy lấy children
    } else {
        console.log(`Node "${node.name}" non children or array`);
    }

    return nodeInfo;
}


// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg: { type: string, count: number }) => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'create-shapes') {
        // This plugin creates rectangles on the screen.
        const numberOfRectangles = msg.count;

        const nodes: SceneNode[] = [];
        for (let i = 0; i < numberOfRectangles; i++) {
            const rect = figma.createRectangle();
            rect.x = i * 150;
            rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
            figma.currentPage.appendChild(rect);
            nodes.push(rect);
        }
        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
    }

    if (msg.type === 'logging') {
        console.log("--Start Logging Data");

        const selection = figma.currentPage.selection;

        if (selection.length === 0) {
            figma.notify("No layer selected");
        } else {
            const selectedLayersInfo = selection.map(layer => getNodeInfo(layer));

            console.log("Code Data::", selectedLayersInfo);

            figma.ui.postMessage({
                type: 'save-json',
                data: selectedLayersInfo
            });
            figma.notify("Success");
        }
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    // figma.closePlugin();
};