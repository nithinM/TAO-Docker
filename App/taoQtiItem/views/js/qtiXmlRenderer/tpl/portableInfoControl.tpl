<infoControl {{{join attributes '=' ' ' '"'}}}>
    <portableInfoControl infoControlTypeIdentifier="{{typeIdentifier}}" hook="{{entryPoint}}" xmlns="http://www.imsglobal.org/xsd/portableInfoControl">
        <resources>
            <libraries>
                {{#each libraries}}
                <lib id="{{.}}"/>
                {{/each}}
            </libraries>
        </resources>
        {{{portableElementProperties properties ''}}}
        <markup xmlns="http://www.w3.org/1999/xhtml">
            {{{markup}}}
        </markup>
    </portableInfoControl>
</infoControl>