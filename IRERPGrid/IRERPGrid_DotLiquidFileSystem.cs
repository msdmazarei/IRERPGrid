using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DotLiquid.FileSystems;
namespace IRERP.Web.Controls
{
    public class IRERPGrid_DotLiquidFileSystem : IFileSystem
    {
        string _TemplatePath = null;
        public IRERPGrid_DotLiquidFileSystem(string TemplatePath=null)
        {
            if(TemplatePath!=null)
                _TemplatePath = TemplatePath;
        }
        public string ReadTemplateFile(DotLiquid.Context context, string templateName)
        {
            if (templateName != null && templateName.IndexOf("/") > -1)
                templateName = templateName.Replace('/', '\\');
            if (templateName.IndexOf('\\') == 0)
                templateName = templateName.Substring(1, templateName.Length - 1);
                     
            if (_TemplatePath != null) templateName = _TemplatePath + "\\" + templateName;
            if (System.IO.File.Exists(templateName))
                return System.IO.File.ReadAllText(templateName);
            return "";
        }
    }
}
