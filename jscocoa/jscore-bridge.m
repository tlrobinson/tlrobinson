#import <Foundation/Foundation.h>
#import <JavaScriptCore/JavaScriptCore.h>

#include <stdio.h>
#include <sys/stat.h>

JSClassRef objc_class;

// Utilities

void escape(char *src, char *dst)
{
    while (*src != '\0')
    {
        if (*src == '\'')
        {
            *(dst++) = '\\';
            *(dst++) = '\'';
        }
        else if (*src == '\n')
        {
            *(dst++) = '\\';
            *(dst++) = 'n';
        }
        else
        {    
            *(dst++) = *src;
        }
        src++;
    }
    *dst = '\0';
}

// Helpers

void JSValuePrint(
    JSContextRef ctx,
    JSValueRef value,
    JSValueRef *exception)
{
    JSStringRef string = JSValueToStringCopy(ctx, value, exception);
    size_t length = JSStringGetLength(string);
    
    char *buffer = malloc(length+1);
    JSStringGetUTF8CString(string, buffer, length+1);
    JSStringRelease(string);
    
    puts(buffer);
    
    free(buffer);
}

JSStringRef JSReadFile(
    JSContextRef ctx,
    JSValueRef value,
    JSValueRef *exception)
{
    JSStringRef result = NULL;
    char *path;
    
    JSStringRef pathJS = JSValueToStringCopy(ctx, value, exception);
    size_t maxPathLength = JSStringGetMaximumUTF8CStringSize(pathJS) + 1;
    if ((path = malloc(maxPathLength)) == NULL) {
        perror("malloc");
        return NULL;
    }
    
    JSStringGetUTF8CString(pathJS, path, maxPathLength);
    
    JSStringRelease(pathJS);
    
    //printf("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv %s vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv\n", path);
    
    struct stat st;
    if (stat(path, &st) >= 0)
    {
        //printf("    size=%lu\n", (unsigned long)st.st_size);
        char *buffer;
        FILE *fp;
        
        if ((buffer = malloc(st.st_size + 1)))
        {
            if ((fp = fopen(path, "r")))
            {
                off_t bytes_read = fread(buffer, 1, st.st_size+1, fp);
                buffer[bytes_read] = '\0';
                    
                if (bytes_read == st.st_size)
                {
                    //printf("    read=%lu\n", (unsigned long)bytes_read);
                    //printf("    strlen=%lu\n", (unsigned long)strlen(buffer));
                    result = JSStringCreateWithUTF8CString(buffer);
                    //printf("    result=%p\n", result);
                    if (result) {
                        //printf("    length=%lu\n", (unsigned long)JSStringGetLength(result));
                    }
                }
                else
                {
                    //perror("    fread");
                }
            
                if (fclose(fp) != 0) {
                    //perror("    fclose");
                }
            }
            else
            {
                //perror("    fopen");
            }
            
            free(buffer);
        }
        else
        {
            //perror("    malloc");
        }
    }
    else
    {
        //perror("    stat");
    }
    
    free(path);
    
    if (!result) {
        //printf("    Using empty string!\n");
        result = JSStringCreateWithUTF8CString("");
    }
    
    //printf("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ %lu ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n", (unsigned long)JSStringGetLength(result));
    
    return result;
}

void JSLoad(
    JSContextRef ctx,
    JSValueRef value,
    JSValueRef *exception)
{
    JSStringRef script = JSReadFile(ctx, value, exception);
    
    if (JSCheckScriptSyntax(ctx, script, 0, 0, exception))
    {
        JSEvaluateScript(ctx, script, 0, 0, 0, exception);
    }
    
    JSStringRelease(script);
}

// Global Functions

JSValueRef JSFunctionPrint (
    JSContextRef ctx,
    JSObjectRef function,
    JSObjectRef thisObject,
    size_t argumentCount,
    const JSValueRef arguments[],
    JSValueRef *exception)
{
    size_t i;
    for (i = 0; i < argumentCount; i++)
    {
        if (i > 0)
            printf(" ");
            
        JSValuePrint(ctx, arguments[i], exception);
    }
    
    return NULL;
}

JSValueRef JSFunctionLoad (
    JSContextRef ctx,
    JSObjectRef function,
    JSObjectRef thisObject,
    size_t argumentCount,
    const JSValueRef arguments[],
    JSValueRef *exception)
{
    size_t i;
    for (i = 0; i < argumentCount; i++)
    {
        JSLoad(ctx, arguments[i], exception);
    }
    
    return NULL;
}

JSValueRef JSFunctionReadFile (
    JSContextRef ctx,
    JSObjectRef function,
    JSObjectRef thisObject,
    size_t argumentCount,
    const JSValueRef arguments[],
    JSValueRef *exception)
{
    return JSValueMakeString(ctx, (argumentCount > 0) ? JSReadFile(ctx, arguments[0], exception) : JSStringCreateWithUTF8CString(""));
}

JSValueRef JSFunctionQuit (
    JSContextRef ctx,
    JSObjectRef function,
    JSObjectRef thisObject,
    size_t argumentCount,
    const JSValueRef arguments[],
    JSValueRef *exception)
{
    if (argumentCount > 0 && JSValueIsNumber(ctx, arguments[0]))
        exit((int)JSValueToNumber(ctx, arguments[0], exception));
    else
        exit(0);
}


// Obj-C Bindings

NSString* NSStringCreateWithJSString(JSStringRef jsString)
{
    size_t length = JSStringGetLength(jsString);

    char *buffer = malloc(length+1);
    JSStringGetUTF8CString(jsString, buffer, length+1);
    
    NSString *string = [NSString stringWithCString:buffer encoding:NSUTF8StringEncoding];
    
    free(buffer);
    
    return string;
}

JSValueRef JSFunctionGetObjCClass (
    JSContextRef ctx,
    JSObjectRef function,
    JSObjectRef thisObject,
    size_t argumentCount,
    const JSValueRef arguments[],
    JSValueRef *exception)
{
    if (argumentCount > 0) {
        JSStringRef jsString = JSValueToStringCopy(ctx, arguments[0], exception);
        
        NSString *className = NSStringCreateWithJSString(jsString);
        
        JSStringRelease(jsString);
        
        id class = NSClassFromString(className);
        
        [className release];
        
        NSLog([class description]);
        
        return JSObjectMake(ctx, objc_class, class);
    }
    
    return NULL;
}

NSString * ObjCSelectorEscape(NSString *original)
{
	NSString *name = [original stringByReplacingOccurrencesOfString:@"$" withString:@"$$"];
	name = [name stringByReplacingOccurrencesOfString:@"_" withString:@"$_"];
	name = [name stringByReplacingOccurrencesOfString:@":" withString:@"_"];
    return name;
}

NSString * ObjCSelectorUnescape(NSString *original)
{
	NSString *name = [original stringByReplacingOccurrencesOfString:@"_" withString:@":"];
	name = [name stringByReplacingOccurrencesOfString:@"$_" withString:@"_"];
	name = [name stringByReplacingOccurrencesOfString:@"$$" withString:@"$"];
    return name;
}

bool objc_hasProperty (
    JSContextRef ctx,
    JSObjectRef object,
    JSStringRef propertyName)
{
    NSString *name = NSStringCreateWithJSString(propertyName);
    NSString *selector = ObjCSelectorUnescape(name);
    
    NSLog(@"objc_hasProperty: %@ => %@\n", name, selector);
    
    id obj = JSObjectGetPrivate(object);
    SEL sel = NSSelectorFromString(selector);
    
    BOOL responds = (obj && sel && [obj respondsToSelector:sel]);
    
    NSLog(@"responds=%d", responds);
    
    return responds;
}

JSStringRef selectorName;

JSValueRef objc_function(
    JSContextRef ctx,
    JSObjectRef function,
    JSObjectRef thisObject,
    size_t argumentCount,
    const JSValueRef arguments[],
    JSValueRef *exception)
{
    JSStringRef jsSelector = JSValueToStringCopy(ctx, JSObjectGetProperty(ctx, function, selectorName, exception), exception);
    
    NSString *name = NSStringCreateWithJSString(jsSelector);
    NSString *selector = ObjCSelectorUnescape(name);
    
    id obj = JSObjectGetPrivate(thisObject);
    SEL sel = NSSelectorFromString(selector);
    
    NSLog(@"[%@ performSelector: %@]", [obj description], selector);
    
    id result = [obj performSelector:sel];
    
    //if (result)
    //    NSLog(@"result=%@", [result description]);
    
    return JSObjectMake(ctx, objc_class, result);
}

JSValueRef objc_getProperty(
    JSContextRef ctx,
    JSObjectRef object,
    JSStringRef propertyName,
    JSValueRef *exception)
{
    NSLog(@"objc_getProperty: %@\n", NSStringCreateWithJSString(propertyName));
    
    JSObjectRef func = JSObjectMakeFunctionWithCallback(ctx, propertyName, objc_function);
    
    JSObjectSetProperty(ctx, func, selectorName, JSValueMakeString(ctx, propertyName), kJSPropertyAttributeReadOnly, exception);
    
    return func;
}

void bindObjectiveC(JSContextRef ctx)
{
    selectorName = JSStringCreateWithUTF8CString("selector");
    
    JSClassDefinition objc_definition = kJSClassDefinitionEmpty;
    
    objc_definition.version             = 0;
    objc_definition.attributes          = kJSClassAttributeNone;
    objc_definition.className           = "ObjectiveC";
    objc_definition.parentClass         = NULL;
    //objc_definition.staticValues;
    //objc_definition.staticFunctions;
    //objc_definition.initialize;
    //objc_definition.finalize;
    objc_definition.hasProperty         = objc_hasProperty;
    objc_definition.getProperty         = objc_getProperty;
    //objc_definition.setProperty;
    //objc_definition.deleteProperty;
    //objc_definition.getPropertyNames;
    //objc_definition.callAsFunction;
    //objc_definition.callAsConstructor;
    //objc_definition.hasInstance;
    //objc_definition.convertToType;
    
    objc_class = JSClassCreate(&objc_definition);
    
}

int main(int argc, char const *argv[])
{
    unsigned i;
    JSValueRef exception = 0;
    JSGlobalContextRef ctx = JSGlobalContextCreate(0);
 
    [[NSAutoreleasePool alloc] init];
       
    JSObjectRef global = JSContextGetGlobalObject(ctx);
    
    bindObjectiveC(ctx);
    
    // arguments
    JSStringRef arrayName = JSStringCreateWithUTF8CString("Array");
    JSObjectRef arrayConstructor = JSValueToObject(ctx, JSObjectGetProperty(ctx, global, arrayName, NULL), NULL);
    JSStringRelease(arrayName);
    
    JSObjectRef arguments = JSObjectCallAsConstructor(ctx, arrayConstructor, 0, NULL, NULL);
    unsigned argNum = 0;
    for (i = 1; i < argc; i++) {
        JSStringRef argString = JSStringCreateWithUTF8CString(argv[i]);
        JSValueRef argument = JSValueMakeString(ctx, argString);
        JSStringRelease(argString);
        
        JSObjectSetPropertyAtIndex(ctx, arguments, argNum++, argument, &exception);
    }
    
    JSStringRef argumentsName = JSStringCreateWithUTF8CString("arguments");
    JSObjectSetProperty(ctx, global, argumentsName, arguments, 0, &exception);
    JSStringRelease(argumentsName);
    
    // print
    JSStringRef printName = JSStringCreateWithUTF8CString("print");
    JSObjectSetProperty(ctx, global, printName, JSObjectMakeFunctionWithCallback(ctx, NULL, JSFunctionPrint), 0, &exception);
    JSStringRelease(printName);
    
    // load
    JSStringRef loadName = JSStringCreateWithUTF8CString("load");
    JSObjectSetProperty(ctx, global, loadName, JSObjectMakeFunctionWithCallback(ctx, NULL, JSFunctionLoad), 0, &exception);
    JSStringRelease(loadName);

    // readFile
    JSStringRef readFileName = JSStringCreateWithUTF8CString("readFile");
    JSObjectSetProperty(ctx, global, readFileName, JSObjectMakeFunctionWithCallback(ctx, NULL, JSFunctionReadFile), 0, &exception);
    JSStringRelease(readFileName);
    
    // quit
    JSStringRef quitName = JSStringCreateWithUTF8CString("quit");
    JSObjectSetProperty(ctx, global, quitName, JSObjectMakeFunctionWithCallback(ctx, NULL, JSFunctionQuit), 0, &exception);
    JSStringRelease(quitName);

    // getObjCClass
    JSStringRef getObjCClassName = JSStringCreateWithUTF8CString("getObjCClass");
    JSObjectSetProperty(ctx, global, getObjCClassName, JSObjectMakeFunctionWithCallback(ctx, NULL, JSFunctionGetObjCClass), 0, &exception);
    JSStringRelease(getObjCClassName);

    while (1)
    {
        char buffer[1024];
        
        exception = NULL;
        
        printf("js> ");
        
        if (fgets(buffer, 1024, stdin) == NULL)
            exit(0);
        
        JSStringRef script;
        
        if (1)
        {
            char escaped[2048], code[4096];
            
            escape(buffer, escaped);
            
            sprintf(code, "var code = '%s'; eval(this.objj_preprocess ? objj_preprocess(code)[0].info : code);", escaped);
            
            script = JSStringCreateWithUTF8CString(code);
        }
        else
        {    
            script = JSStringCreateWithUTF8CString(buffer);
        }
        
        if (JSCheckScriptSyntax(ctx, script, 0, 0, &exception) && !exception)
        {
            JSValueRef value = JSEvaluateScript(ctx, script, 0, 0, 0, &exception);
            
            if (exception)
                JSValuePrint(ctx, exception, NULL);
            
            if (value && !JSValueIsUndefined(ctx, value))
                JSValuePrint(ctx, value, &exception);
        }
        else
        {
            printf("Syntax error\n");
        }
        
        JSStringRelease(script);
    }
    
    return 0;
}
