import { Primer } from "./primer";


export const displayPrimerWindow = () => {

    const w = 600;
    const h = 500;
  
    const dualScreenLeft = window.screenLeft !==  undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !==  undefined   ? window.screenTop  : window.screenY;
  
    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
  
    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    const top = (height - h) / 2 / systemZoom + dualScreenTop;
  
    //window.open("http://cnn.com", "_blank", "width=500,height=400");
  
    const primerWindow = window.open("", "_blank", 
      `
      scrollbars=yes,
      width=${w / systemZoom}, 
      height=${h / systemZoom}, 
      top=${top}, 
      left=${left}
      `
    );

    if (window.focus) primerWindow.focus();
  
  
    return primerWindow;
}


export const generatePrimerWindowContent = (group, sequence, position) => {

    const base = sequence[position];
    const referenceBase = base.getReferenceBase();
    
    let html = "<html>";

    // HEAD

    html += "<head>";
    html += "<title>Primers " + group + " " + position + "</title>";
    html += getPrimerWindowStyle();
    html += "</head>";

    // BODY

    html += "<body>";
    html += "<div class=\"wrapper\">";

    html += getHeaderDiv(group, position, base);

    // PRIMERS

    html += "<div class=\"primerWindow\">";

    //html += getPrimerTypeDropdown();

    // REFERENCE ALLELE PRIMER

    let primerTypeName = "Reference Allele Primers";

    html += getPrimerTypeDiv(primerTypeName, sequence, position, base.getReferenceBase());

    // MUTANT ALLELE PRIMERS

    base.getMutantBases().forEach((mutantBase) => {

        primerTypeName = referenceBase + position + mutantBase + " Primers";

        html += getPrimerTypeDiv(primerTypeName, sequence, position, mutantBase);
    });

    html += "</div>"; // primerWindow DIV
    html += getFooterDiv();
    html += "</div>"; // wrapper DIV

    html += "</body>";

    html += "</html>";

    return html;
}


function getHeaderDiv(group, position, base) {

    let header = "<div class=\"header\">";
    header += "<img src=\"../../../dist/1730310c32752e095ee7.svg\"/>";
    header += "<h1>primers</h1>";

    header += "<ul>";
    header += "<li>Sequence Group: <span class=\"dataText\">" + group + "</span></li>";
    header += "<li>Selected Position: <span class=\"dataText\">" + position + "</span></li>";
    header += "<li>Reference Allele: <span class=\"dataText\">" + base.getReferenceBase() + "</span></li>";
    
    if(base.hasMutation()) {
        let mutantBases = base.getMutantBases();
        header += "<li>Alternative Allele";
        if(mutantBases.size > 1) {
            header += "s";
        }
        header += ": ";
        for(const mutantBase of mutantBases) {
            header += "<span class=\"dataText\">";
            header += mutantBase;
        }
        header += "</span></li>";
    }
    header += "<li>" + getPrimerTypeDropdown(base) + "</li>";
    header += "</ul>";
    header += "</div>";

    return header;
}


function getPrimerTypeDropdown(base) {

    let dropdown = " <div class=\"selectWrapper\">";
    dropdown += "<select class=\"selectBox\" id=\"selectPrimerTypes\" onchange=\"alert(this.value)\">";
    dropdown += "<option value=\"Reference Allele Primers\">Reference Allele Primers</option>";
    base.getMutantBases().forEach((mutantBase) => {
        let name = `${base.getReferenceBase()}${base.getLocation()}${mutantBase} Primers`;
        dropdown += `<option value=\"${name}\">${name}</option>`;
    });
    dropdown += "</select>";
    dropdown += "</div>";

    return dropdown;
}


function getPrimerTypeDiv(primerTypeName, sequence, position, displayBase) {

    let div = "<div class=\"primers\ id=\"" + primerTypeName + "\">";

    div += "<h2>" + primerTypeName + "</h2>";

    let primer = new Primer(sequence, position, displayBase, 12, 12);
    div += getPrimerPairHtml(primer);
    
    primer = new Primer(sequence, position, displayBase, 13, 12);
    div += getPrimerPairHtml(primer);
    
    primer = new Primer(sequence, position, displayBase, 13, 13);
    div += getPrimerPairHtml(primer);
    
    primer = new Primer(sequence, position, displayBase, 14, 13);
    div += getPrimerPairHtml(primer);
    
    primer = new Primer(sequence, position, displayBase, 14, 14);
    div += getPrimerPairHtml(primer);
    
    div += "</div>";

    return div;
}


function getPrimerPairHtml(primer) {

    let html = "5' ";
    html += "<span class=\"primerText\">";
    html += primer.getForwardSequence();
    html += "</span>";
    html += " 3'";
    html += " Tm: ";
    html += primer.getTm();
    html += "&deg;C GC: ";
    html += primer.getGCPercent();
    html += "%";
    html += "<br/>";

    html += "3' ";
    html += "<span class=\"primerText\">";
    html += primer.getReverseSequence();
    html += "</span>";
    html += " 5'";
    html += " Tm: ";
    html += primer.getTm();
    html += "&deg;C GC: ";
    html += primer.getGCPercent();
    html += "%";
    html += "<br/><br/>";

    return html;
}


function getFooterDiv() {

    let footer = "<div class=\"footer\">";
    footer += "<a href=\"https://www.radxrad.org\">RADx Radical DCC 2023</a>";
    footer += "</div>";

    return footer;
}


function getPrimerWindowStyle() {

    let style = "<style>";

    style += `
        html {
            font-family: "Lato", "Helvetica Neue", "Helvetica", "sans-serif";
            font-size: 14px;
            color: var(--medGrey);
            backgroundColor: "#FFF";
        }
        body {
            margin: 0;
            padding: 0;
        }  
        h2 {
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            font-size: 28px;
            margin-left: 0px;
            margin-top: 15px;
            margin-bottom: 15px;
            font-weight: 350;
            color: rgb(51, 51, 51);
            letter-spacing: -0.5px;
            line-height: 1.2;
        }
        h4 {
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            font-size: 16px;
            margin-left: 0px;
            margin-top: 10px;
            margin-bottom: 10px;
            font-weight: 350;
            color: rgb(51, 51, 51);
            letter-spacing: -0.5px;
            line-height: 1.2;
        }
        h5 {
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            font-size: 14px;
            margin-left: 0px;
            margin-top: 5px;
            margin-bottom: 5px;
            font-weight: 350;
            color: rgb(51, 51, 51);
            letter-spacing: -0.5px;
            line-height: 1.0;
        }
        .selectWrapper{
            margin-top: 5px;
            border-radius:5px;
            display:inline-block;
            overflow:hidden;
            background:#cccccc;
            border:1px solid #cccccc;
        }
        .selectBox{
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            width: 200px;
            height: 30px;
            border: 0px;
            outline: none;
            font-weight: 350;
            color: rgb(51, 51, 51);
            letter-spacing: -0.5px;
            line-height: 1.2;
            border: 6px solid transparent;
            border-color: #fff transparent transparent transparent;
        }
        .wrapper {
            min-height: 100%;
            display: grid;
            grid-template-rows: auto 1fr auto;
        }
        .header {
            margin-top: 0;
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            vertical-align: middle;
            background: #30353F;
            padding: 0px;
            width: 100%;
            height: 225px;
        }
        .header img {
            float: left;
            margin: 25px 15px 15px 25px;
            width: 50px;
            height: 50px;
        }
        .header h1 {
            text-align: center;
            line-height: 20px;
            color: #D3D3D3;
            font-size: 38px;
            font-weight: 350;
            letter-spacing: 1.5rem;
        }
        .header ul {
            margin: 50px 20px;
            text-align: left;
            color: #D3D3D3;
            list-style-type: none;
        }
        .dataText {
            color: #5DA8A3;
        }
        .primerWindow {
            padding: 0px;
            width: 60%;
            margin: auto;
            background: "#FDDDE6";
            padding-bottom: 50px;
        }
        .primers {
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            font-size: 16px;
        }
        .primerText {
            font-family: "courier", "courier new", "serif";
            font-size: 16px;
        }
        .primerWindow h2 {
            font-family: Lato, &quot;Helvetica Neue&quot;, Helvetica, sans-serif;
            font-size: 28px;
            margin-left: 0px;
            margin-top: 15px;
            margin-bottom: 15px;
            font-weight: 350;
            color: rgb(51, 51, 51);
            letter-spacing: -0.5px;
            line-height: 1.2;
        }
        .footer {
            margin-top: 0;
            text-align: center;
            vertical-align: middle;
            background: #30353F;
            padding: 0px;
            width: 100%;
            height: 50px;
            line-height: 50px;
            text-decoration: none;
            color: #D3D3D3;
            font-size: 14px;
            font-weight: 400;
            position: relative;
            margin-top: -50px;
        }
        .footer a:link {
            text-decoration: none;
            color: #D3D3D3;
        }
        .footer a:visited {
            text-decoration: none;
            color: #D3D3D3;
        }
    `;

    style += "</style>";

    return style;
}
