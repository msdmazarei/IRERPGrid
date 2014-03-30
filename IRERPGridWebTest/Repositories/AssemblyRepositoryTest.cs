using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IRERPGridWebTest.Repositories
{
    public class AssemblyRepositoryTest
    {
        public static IList AllAssemblies()
        {
            
                List<Type> lst = new List<Type>();
                try
                {
                    AppDomain.CurrentDomain.GetAssemblies().ToList().ForEach(y => { lst.AddRange(y.GetTypes()); });
                }
                catch { }

                return lst;

            
        }
    }
}