import React, { useState } from 'react';
import { chunkText, getChunkStats } from '@/lib/textChunking';
import { generateEmbedding, cosineSimilarity, getCacheStats } from '@/lib/embeddings';
import { indexFile } from '@/lib/rag';
import { searchSimilarChunks, parseFileReferences } from '@/lib/rag';
import { getVectorStoreStats } from '@/lib/vectorStore';
import { getAllFiles } from '@/lib/fileStorage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RAGTestPanel({ isOpen, onClose }: Props) {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    try {
      addResult('🚀 开始 RAG 功能测试...');
      
      // Test 1: Text Chunking
      addResult('\n📝 测试 1: 文本分块');
      const testText = '这是一个测试文本。'.repeat(100);
      const chunks = chunkText(testText, 'test-file', 'test.txt');
      const stats = getChunkStats(chunks);
      addResult(`✅ 生成了 ${stats.totalChunks} 个文本块`);
      addResult(`   平均大小: ${stats.avgChunkSize} 字符`);
      addResult(`   总词数: ${stats.totalWords}`);
      
      // Test 2: API Key Check
      addResult('\n🔑 测试 2: API Key 检查');
      const apiKey = localStorage.getItem('openai_api_key'); // 修改为使用下划线
      if (!apiKey) {
        addResult('❌ 未找到 OpenAI API Key');
        addResult('   ⚠️ RAG 功能需要 OpenAI API Key 用于生成 embeddings');
        addResult('   💡 即使使用 DeepSeek 聊天，也需要 OpenAI Key 用于文档索引');
        addResult('   请在设置中配置 OpenAI provider 并保存 API Key');
        setTesting(false);
        return;
      }
      addResult('✅ API Key 已配置');
      addResult('   ℹ️ 使用 OpenAI embeddings API (text-embedding-3-small)');
      
      // Test 3: Embedding Generation
      addResult('\n🧮 测试 3: 嵌入生成');
      try {
        const text1 = '机器学习是人工智能的一个分支';
        const text2 = '深度学习是机器学习的一种方法';
        const text3 = '今天天气很好';
        
        addResult('   生成嵌入向量...');
        const emb1 = await generateEmbedding(text1, apiKey);
        const emb2 = await generateEmbedding(text2, apiKey);
        const emb3 = await generateEmbedding(text3, apiKey);
        
        addResult(`✅ 嵌入维度: ${emb1.length}`);
        
        // Test 4: Similarity Calculation
        addResult('\n📊 测试 4: 相似度计算');
        const sim12 = cosineSimilarity(emb1, emb2);
        const sim13 = cosineSimilarity(emb1, emb3);
        
        addResult(`   "${text1}" vs "${text2}"`);
        addResult(`   相似度: ${sim12.toFixed(4)} ${sim12 > 0.7 ? '✅ 高相关' : '⚠️ 低相关'}`);
        addResult(`   "${text1}" vs "${text3}"`);
        addResult(`   相似度: ${sim13.toFixed(4)} ${sim13 < 0.5 ? '✅ 低相关' : '⚠️ 高相关'}`);
      } catch (error) {
        addResult(`❌ 嵌入生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
        setTesting(false);
        return;
      }
      
      // Test 5: File Indexing
      addResult('\n📚 测试 5: 文件索引');
      const files = await getAllFiles();
      if (files.length === 0) {
        addResult('⚠️ 没有已上传的文件');
        addResult('   请先上传一些文件进行测试');
      } else {
        addResult(`✅ 找到 ${files.length} 个文件`);
        
        // Index first file if not already indexed
        const firstFile = files[0];
        addResult(`   索引文件: ${firstFile.name}`);
        try {
          await indexFile(firstFile, apiKey, (current, total) => {
            if (current % 5 === 0 || current === total) {
              addResult(`   进度: ${current}/${total} chunks`);
            }
          });
          addResult('✅ 文件索引完成');
        } catch (error) {
          addResult(`⚠️ 索引可能已存在或失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }
      
      // Test 6: Semantic Search
      addResult('\n🔍 测试 6: 语义搜索');
      try {
        const searchQuery = '人工智能';
        addResult(`   搜索: "${searchQuery}"`);
        const results = await searchSimilarChunks(searchQuery, apiKey, 3);
        
        if (results.length === 0) {
          addResult('⚠️ 没有找到相关结果');
          addResult('   可能需要先索引一些文件');
        } else {
          addResult(`✅ 找到 ${results.length} 个相关结果:`);
          results.forEach((result, i) => {
            addResult(`   ${i + 1}. ${result.fileName}`);
            addResult(`      相似度: ${result.similarity.toFixed(4)}`);
            addResult(`      内容: ${result.content.substring(0, 50)}...`);
          });
        }
      } catch (error) {
        addResult(`⚠️ 搜索失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
      
      // Test 7: File Reference Parsing
      addResult('\n🏷️ 测试 7: @文件引用解析');
      const testMessage = '请分析 @research.pdf 和 @notes.txt 中的内容';
      const { cleanMessage, fileRefs } = parseFileReferences(testMessage);
      addResult(`   原始消息: ${testMessage}`);
      addResult(`   清理后: ${cleanMessage}`);
      addResult(`   文件引用: ${fileRefs.join(', ')}`);
      addResult(fileRefs.length === 2 ? '✅ 解析正确' : '❌ 解析错误');
      
      // Test 8: Storage Stats
      addResult('\n💾 测试 8: 存储统计');
      const vectorStats = await getVectorStoreStats();
      const cacheStats = getCacheStats();
      
      addResult(`   向量存储:`);
      addResult(`   - 总 chunks: ${vectorStats.totalChunks}`);
      addResult(`   - 总文件: ${vectorStats.totalFiles}`);
      addResult(`   - 平均 chunks/文件: ${vectorStats.avgChunksPerFile}`);
      addResult(`   - 估计大小: ${vectorStats.estimatedSize.toFixed(2)} MB`);
      addResult(`   嵌入缓存:`);
      addResult(`   - 缓存条目: ${cacheStats.size}`);
      addResult(`   - 内存使用: ${cacheStats.memoryUsage.toFixed(2)} MB`);
      
      addResult('\n✅ 所有测试完成！');
      
    } catch (error) {
      addResult(`\n❌ 测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-canvas-node border border-canvas-border rounded-xl w-[800px] max-w-[90vw] h-[600px] max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-canvas-border">
          <div>
            <h2 className="text-lg font-semibold text-canvas-text">RAG 功能测试</h2>
            <p className="text-sm text-canvas-text-muted">测试文本分块、嵌入生成、语义搜索等功能</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-canvas-bg rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-canvas-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {testResults.length === 0 ? (
            <div className="text-center text-canvas-text-muted py-8">
              <div className="text-4xl mb-4">🧪</div>
              <p>点击下方按钮开始测试</p>
            </div>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, i) => (
                <div
                  key={i}
                  className={`text-sm font-mono ${
                    result.includes('✅') ? 'text-green-400' :
                    result.includes('❌') ? 'text-red-400' :
                    result.includes('⚠️') ? 'text-yellow-400' :
                    result.includes('🚀') || result.includes('📝') || result.includes('🔑') || 
                    result.includes('🧮') || result.includes('📊') || result.includes('📚') || 
                    result.includes('🔍') || result.includes('🏷️') || result.includes('💾') ? 'text-blue-400' :
                    'text-canvas-text-muted'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center gap-3 p-4 border-t border-canvas-border">
          <div className="text-xs text-canvas-text-muted">
            {testing ? '测试进行中...' : testResults.length > 0 ? '测试完成' : '准备测试'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setTestResults([])}
              disabled={testing || testResults.length === 0}
              className="px-4 py-2 text-sm border border-canvas-border hover:border-canvas-accent text-canvas-text rounded-lg transition-colors disabled:opacity-50"
            >
              清空
            </button>
            <button
              onClick={runTests}
              disabled={testing}
              className="px-4 py-2 text-sm bg-canvas-accent hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {testing ? '测试中...' : '开始测试'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
