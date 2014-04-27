using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization.Formatters;
using System.Text;
using System.Threading.Tasks;

namespace IRERP.Web.Controls
{

    public class General
    {
        public static object GetDotLiquidVariable(DotLiquid.Context context, string varname)
        {
            
            var q = (from x in context.Scopes where x.Keys.Contains(varname) select x).FirstOrDefault();
            if (q != null)
                return (from x in context.Scopes
                        from y in x.Keys
                        where y == varname
                        select x[y]).FirstOrDefault();
            q = (from x in context.Environments where x.Keys.Contains(varname) select x).FirstOrDefault();
            if(q!=null)
                return (from x in context.Environments
                        from y in x.Keys
                        where y == varname
                        select x[y]).FirstOrDefault();

            return null;
        }
        public static Dictionary<string,object> GetDotLiquidVariables(DotLiquid.Context context, List<string> args)
        {
            Dictionary<string, object> rtn = new Dictionary<string, object>();
            if (args != null && context != null && context.Scopes != null)
            {
                args.ForEach(x => {
                    if (!rtn.Keys.Contains(x))
                    {
                        object value = null;
                        x = x.Trim();
                        
                        if (x.IndexOf(".") > -1)
                        {
                            string masterVar = x.Split('.')[0];
                            value =GetDotLiquidVariable(context,masterVar);
                            string[] parts = x.Split('.');
                            string propn= string.Join(".", parts, 1, parts.Length - 1);
                            if( value!=null)
                            value = IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetProperty(value, propn);
                        }
                        else
                        {
                            value =GetDotLiquidVariable(context,x);
                        }
                        rtn.Add(x, value);
                            
                    }
                });

            }
            
            return rtn;
        }

        

        [ThreadStatic]
        static DotLiquid.Context _context = null;
        
        public static DotLiquid.Context IRERPGrid_DotLiquidContext
        {
            get
            {
                if (_context == null) _context = new DotLiquid.Context();
                return _context;
            }
        }
        public static string SerialzieToJson(object obj)
        {
            string str =
                Newtonsoft.Json
                .JsonConvert.SerializeObject(
                obj,
                Formatting.Indented,
                new JsonSerializerSettings
                {
                    TypeNameHandling = TypeNameHandling.All,
                    TypeNameAssemblyFormat = FormatterAssemblyStyle.Simple
                });
            return str;
        }
        public static string ToSimpleJSON(object obj)
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(obj);
            
        }
        public static object DeSerializeFromJson(string str)
        {
            return Newtonsoft.Json.JsonConvert.DeserializeObject(str, new JsonSerializerSettings
            {
                TypeNameHandling = TypeNameHandling.All,
                TypeNameAssemblyFormat = FormatterAssemblyStyle.Simple
            });
            //  return ser.Deserialize(new System.IO.MemoryStream(buf));

        }
        public static T DeSerializeFromJson<T>(string str)
            
        {
            try
            {
                return Newtonsoft.Json.JsonConvert.DeserializeObject<T>(str);
            }catch{
                return default(T);
            }
        }
        public static void StoreGrid(IRERPGrid Grid)
        {
            string GridSessionIdentifier = Grid.Name;
            IRERP_RestAPI.Bases.IRERPApplicationUtilities.SaveToSession(GridSessionIdentifier, SerialzieToJson(Grid));
        }
        public static IRERPGrid GetGrid(string GridSessionIdentifier)
        {
            return (IRERPGrid)
                DeSerializeFromJson(
                (string)IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetFromSession(GridSessionIdentifier)
                );
        }
        public static object CallStaticMethod(string path)
        {
            object rtn = null;
            if (path.IndexOf("()") > -1)
            {
                
                string[] parts = path.Split('.');
                if (parts.Length > 1)
                {
                    string classname ="";
                    for (int i = 0; i < parts.Length - 1; i++)
                        classname += parts[i] + ".";
                    if (classname != "") classname = classname.Substring(0, classname.Length - 1);
                    Type ClassType= IRERP_RestAPI.Bases.IRERPApplicationUtilities.GetTypeFromString(classname);
                    var methodinfo = ClassType.GetMethod(parts[parts.Length - 1].Replace("()", ""));
                    if (methodinfo != null)
                       rtn= methodinfo.Invoke(null, null);

                }
                
            }
            else
                return rtn;


            return rtn;
        }
        public static bool CorrectInGrammar( Irony.Parsing.Grammar grammer,string text)
        {
            Irony.Parsing.Parser p = new Irony.Parsing.Parser(grammer);
            return !p.Parse(text).HasErrors();
        }
        public static Irony.Parsing.ParseTree getGrammarTree(Irony.Parsing.Grammar grammar,string text)
        {
            Irony.Parsing.Parser p = new Irony.Parsing.Parser(grammar);
            var rtn = p.Parse(text);
            if(rtn.HasErrors()) return null; else return rtn;

        }
        public static string MsdCritToWhereString(MsdLib.CSharp.BLLCore.MsdCriteria crit)
        {
            string rtn = "";
            Func<MsdLib.CSharp.BLLCore.MsdCriteria, string> ToWhereString = new Func<MsdLib.CSharp.BLLCore.MsdCriteria, string>(x => {
                string rtn1 = "";
                switch (x.Operator)
                {
                    case  MsdLib.CSharp.BLLCore.MsdCriteriaOperator.lessThan:
                        rtn1 = x.fieldName + "<" + x.value;
                        break;
                    case MsdLib.CSharp.BLLCore.MsdCriteriaOperator.lessThanOrEqual:
                        rtn1 = x.fieldName + "<=" + x.value;
                        break;
                    case MsdLib.CSharp.BLLCore.MsdCriteriaOperator.notContains:
                        rtn1 = x.fieldName + "not like " + x.value;
                        break;
                    case MsdLib.CSharp.BLLCore.MsdCriteriaOperator.notEqual:
                        rtn1 = x.fieldName + "<>" + x.value;
                        break;
                    case MsdLib.CSharp.BLLCore.MsdCriteriaOperator.contains:
                        rtn1 = x.fieldName + " like " + x.value;
                        break;
                    case MsdLib.CSharp.BLLCore.MsdCriteriaOperator.greaterThan:
                        rtn1 = x.fieldName + ">" + x.value;
                        break;
                    case MsdLib.CSharp.BLLCore.MsdCriteriaOperator.greaterThanOrEqual:
                        rtn1 = x.fieldName + ">=" + x.value;
                        break;

                }
                return rtn1;
            });

            switch (crit.Operator)
            { 
                case MsdLib.CSharp.BLLCore.MsdCriteriaOperator.or:
                    List<string> ors = new List<string>();
                    foreach (var c in crit.criteria)
                        ors.Add("("+MsdCritToWhereString(c)+")");
                    rtn = string.Join(" or ", ors.ToArray());
                    break;
                case MsdLib.CSharp.BLLCore.MsdCriteriaOperator.and:
                    List<string> ands = new List<string>();
                    foreach (var c in crit.criteria)
                        ands.Add("("+MsdCritToWhereString(c)+")");
                    rtn = string.Join(" and ", ands.ToArray());
                    break;
                default:
                    rtn = ToWhereString(crit);
                    break;
            }

            return rtn;
        }
    }
}
