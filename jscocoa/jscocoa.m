#import <Foundation/Foundation.h>
#import "JSCocoaController.h"

void JSValuePrint(JSContextRef, JSValueRef, JSValueRef *);

int main (int argc, const char * argv[])
{
	[[NSAutoreleasePool alloc] init];
	id c = [JSCocoaController sharedController];
	JSGlobalContextRef ctx = [c ctx];
	
	if (argc > 1)
	{
		for (int i = 1; i < argc; i++)
			[c evalJSFile:[NSString stringWithFormat:@"%s", argv[i]]];
	}
	else
	{
	    while (1)
		{
			char buffer[1024];
			
			printf("js> ");
			
			if (fgets(buffer, 1024, stdin) == NULL)
				exit(0);
			
			JSStringRef script = JSStringCreateWithUTF8CString(buffer);
			JSValueRef exception = NULL;
			
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
		
	}
}

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
