import { AttachmentGalleryControl } from "../../AttachmentGalleryControl";
import { IInputs, IOutputs } from "../../AttachmentGalleryControl/generated/ManifestTypes";
import { XrmFakedContext, Entity } from "fakexrmeasy";
import { FakeContextFactory } from "pcf-mock";

var Guid = require('guid');

describe("PCF Mock test", function () {

    var ctx: XrmFakedContext;
    var pcfContextFactory = new FakeContextFactory<IInputs>();

    var annotationId1 = Guid.create();
    var annotationId2 = Guid.create();
    var mainObjectId = Guid.create();

    beforeEach(() => {
       ctx = new XrmFakedContext("v9.0", "http://fakeUrl", true);

       let searchQuery = "annotations?$select=annotationid,documentbody,mimetype,notetext,subject&$filter=_objectid_value eq " + 
       mainObjectId.toString() + " and  isdocument eq true and startswith(mimetype, 'image/')";
        
       ctx.addFakeMessageExecutor({
            method: "GET",
            relativeUrl: encodeURI(searchQuery),
            execute: (body: any) => {
                return {
                    statusCode: 200,
                    responseBody: {
                        value: [
                                {
                                    id: annotationId1.toString(), 
                                    documentbody: "Asddasada122132asdasd==", 
                                    mimetype: "image/png", 
                                    notetext: "Beatiful image", 
                                    subject: "Subject" 
                                },
                                {   
                                    id: annotationId2.toString(), 
                                    documentbody: "Asddasadasdasda122132asdasd==", 
                                    mimetype: "image/jpeg", 
                                    notetext: "Another Beatiful image", 
                                    subject: "Another Subject"
                                }
                            ] 
                    }
                }
            }
       });
    });

    test("Should return 2 attachments", async done => { 
        var defaultPcfContext = pcfContextFactory.getDefaultContext(ctx, {sampleProperty: { raw: "test", attributes: undefined, error: false, errorMessage: "", type: "string"}});
        var pfcControl = new AttachmentGalleryControl();
        pfcControl._context = defaultPcfContext;
        pfcControl._notes = [];
        
        var result = await pfcControl.GetAttachments({
            entityType: "",
            name: "",
            id: mainObjectId.toString()
        });

        expect(result.length).toBe(2);
        done();
    });

    test("Example calling init", async done => { 
        var defaultPcfContext = pcfContextFactory.getDefaultContext(ctx, {sampleProperty: { raw: "test", attributes: undefined, error: false, errorMessage: "", type: "string"}});
        defaultPcfContext.resources = {
            getResource: (id: string, success: (data: string) => void, failure: () => void) => {},
            getString: (id: string) => ""
        };
        (<any> defaultPcfContext).page = {
            entityId: mainObjectId.toString(),
            entityTypeName: ""
        };

        var pfcControl = new AttachmentGalleryControl();

        var container = document.createElement("div");
        pfcControl.init(defaultPcfContext, () => {}, {}, container);

        done();
    });
});