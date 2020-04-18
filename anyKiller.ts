class A{
    public aName:string;
    public age:number;
    public isMarried:boolean;
    public bRef:B;
}
class B{
    public bTitle:string;
    public cRef:C;
}
class C{
    public isAlive:boolean;
}

enum NameMode{
    normal=1,
    prefix=2,
    suffix=3
}

var serializedInfo:any={
    info:{
        aName:"anyName",
        age:28,
        isMarried:false,
        bRef:{
            bTitle:"Ostad"
            ,cRef:{
                isAlive:false
            }
        },
        // child_A1:1,
        // child_A2:"1",
        a1_Child:2,
        // a2_Child:"2",
        bTitle:"Ostad"
        ,cRef:{
            isAlive:"false"
        },
        isAlive:true
    }
}


class serPropMetadata{
    constructor(public propName:string, public propType:string
                , public isOptional:(info:any)=>boolean, public nameMode:NameMode){


    }

    public get isPrefixed(): boolean{
        return this.nameMode==NameMode.prefix;
    } 
    public get isSuffixed(): boolean{
        return this.nameMode==NameMode.suffix;
    } 
}

let serMetadata:Map<string, serPropMetadata[]>=new Map<string,serPropMetadata[]>();
serMetadata.set('A',[new serPropMetadata('aName', 'string', ()=>{return false;}, NameMode.normal)
            , new serPropMetadata('age', 'number', ()=>{return false}, NameMode.normal)
            , new serPropMetadata('isMarried', 'boolean', ()=>{return false}, NameMode.normal)
            , new serPropMetadata('bRef', 'B', ()=>{return false},NameMode.normal)
            , new serPropMetadata('child_', 'number', (info:any)=>{
                    let serPropMetadata=serMetadata.get("A")?.filter(x=>x.propName=="isMarried")[0];
                    if(serPropMetadata?.isOptional(info)) {
                        console.log("1")
                        return true;
                    }
                    else if(serPropValidity(info, serPropMetadata)){
                        console.log("2")
                        return !info["isMarried"];
                    }
                    else{
                        console.log("3")
                        return true;
                    } 
                },NameMode.prefix)
            , new serPropMetadata('_Child', 'number', ()=>{return false},NameMode.suffix)
           ]);

serMetadata.set('B',[new serPropMetadata('bTitle', 'string', ()=>{return false},NameMode.normal)
            , new serPropMetadata('cRef', 'C', ()=>{return false},NameMode.normal)
            ]);

serMetadata.set('C', [new serPropMetadata('isAlive', 'boolean', ()=>{return false},NameMode.normal)]);




console.log(A.name+" deserializablity: "+serValidtiy(A.name));
console.log(B.name+" deserializablity: "+serValidtiy(B.name));
console.log(C.name+" deserializablity: "+serValidtiy(C.name));


function serValidtiy(key: string): boolean{
    let keyValidity:boolean=true;
    serMetadata.get(key)?.forEach(x=>{
        if(!x.isOptional(serializedInfo.info)){
            if(!serPropValidity(serializedInfo.info, x)) keyValidity=false;
        }
        else{console.log(x.propName + ' is optional!')}
    })
    return keyValidity;
}

function serPropValidity(info:any, serPropMetadata: serPropMetadata|undefined):boolean{
    let propValidity:boolean=true;
    if(serPropMetadata!=undefined){
        if(serPropMetadata.isPrefixed){
            if(Reflect.ownKeys(info).some(j=>j.toString().startsWith(serPropMetadata.propName))){
                Reflect.ownKeys(info).filter(j=>j.toString().startsWith(serPropMetadata.propName)).forEach(j=>{
                    if(!serTypeValidity(info[j],serPropMetadata)) propValidity=false
                })
            }
            else{
                propValidity=false
            }
        }
        else if(serPropMetadata.isSuffixed){
            if(Reflect.ownKeys(info).some(j=>j.toString().endsWith(serPropMetadata.propName))){
                Reflect.ownKeys(info).filter(j=>j.toString().endsWith(serPropMetadata.propName)).forEach(j=>{
                    if(!serTypeValidity(info[j],serPropMetadata)) propValidity=false
                })
            }
            else{
                propValidity=false
            }
        }
        else{
            if(Reflect.has(info, serPropMetadata.propName)){
            if(!serTypeValidity(info[serPropMetadata.propName],serPropMetadata)) propValidity=false
            }
            else{
                propValidity=false;
            }
        }
    }
    else propValidity=false

    return propValidity;
}


function serTypeValidity(val:any, serPropMetadata: serPropMetadata):boolean{
    let typeValidity:boolean=true;
     if(typeof val!=serPropMetadata.propType){
             if(typeof val=='object'){
                 serMetadata.get(serPropMetadata.propType)?.forEach(x=>{
                 if(!serPropValidity(val, x)){
                     typeValidity=false;
                 }
               })
             }
             else{
                 typeValidity=false;
             }
    }
    return typeValidity;
}
