using DotLiquid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IRERP.Web.Controls;
using System.Collections;
using Irony.Parsing;
namespace TestIRERPGrid
{
    class Program
    {
        public static IList TestDataRepo()
            {
                List<Type> lst = new List<Type>();
                try
                {
                    AppDomain.CurrentDomain.GetAssemblies().ToList().ForEach(y => { lst.AddRange(y.GetTypes()); });
                }
                catch { }

                return lst;

            }
        
        static void Main(string[] args)
        {
            IRERPGridColCriteriaGrammar a = new IRERPGridColCriteriaGrammar();
            Parser b = new Parser(a);
            var brtn = b.Parse(">1");
            Console.WriteLine(brtn.HasErrors());
            Console.ReadLine();
            


           
        }
    }
}
